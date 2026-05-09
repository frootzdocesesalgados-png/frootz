import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, productsTable, categoriesTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  GetProductParams,
  CreateProductBody,
  UpdateProductBody,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const productWithCategory = {
  id: productsTable.id,
  name: productsTable.name,
  description: productsTable.description,
  price: productsTable.price,
  originalPrice: productsTable.originalPrice,
  imageUrl: productsTable.imageUrl,
  categoryId: productsTable.categoryId,
  categoryName: categoriesTable.name,
  onPromotion: productsTable.onPromotion,
  featured: productsTable.featured,
  active: productsTable.active,
  createdAt: productsTable.createdAt,
  updatedAt: productsTable.updatedAt,
};

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { categoryId, featured, onPromotion } = parsed.data;

  const conditions = [];
  if (categoryId != null) conditions.push(eq(productsTable.categoryId, categoryId));
  if (featured != null) conditions.push(eq(productsTable.featured, featured));
  if (onPromotion != null) conditions.push(eq(productsTable.onPromotion, onPromotion));

  const products = await db
    .select(productWithCategory)
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(productsTable.createdAt);

  res.json(products.map(formatProduct));
});

router.get("/products/stats", async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      onPromotion: sql<number>`sum(case when on_promotion then 1 else 0 end)::int`,
      featured: sql<number>`sum(case when featured then 1 else 0 end)::int`,
      active: sql<number>`sum(case when active then 1 else 0 end)::int`,
    })
    .from(productsTable);

  const byCategory = await db
    .select({
      categoryName: sql<string>`coalesce(${categoriesTable.name}, 'Sem categoria')`,
      count: sql<number>`count(*)::int`,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.name);

  res.json({
    total: totals?.total ?? 0,
    onPromotion: totals?.onPromotion ?? 0,
    featured: totals?.featured ?? 0,
    active: totals?.active ?? 0,
    byCategory,
  });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select(productWithCategory)
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(formatProduct(product));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { price, originalPrice, ...rest } = parsed.data;

  const [product] = await db
    .insert(productsTable)
    .values({
      ...rest,
      price: String(price),
      originalPrice: originalPrice != null ? String(originalPrice) : null,
    })
    .returning();

  const [withCategory] = await db
    .select(productWithCategory)
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, product.id));

  res.status(201).json(formatProduct(withCategory));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { price, originalPrice, ...rest } = parsed.data;

  const updateData: Record<string, unknown> = {
    ...rest,
    updatedAt: new Date(),
  };
  if (price !== undefined) updateData.price = String(price);
  if (originalPrice !== undefined) updateData.originalPrice = originalPrice != null ? String(originalPrice) : null;

  const [product] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [withCategory] = await db
    .select(productWithCategory)
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, product.id));

  res.json(formatProduct(withCategory));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.sendStatus(204);
});

function formatProduct(p: typeof productWithCategory & { price: string; originalPrice: string | null; categoryName?: string | null }) {
  return {
    ...p,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    categoryName: p.categoryName ?? null,
  };
}

export default router;
