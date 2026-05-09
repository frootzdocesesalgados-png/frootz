import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true, createdAt: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  onPromotion: boolean("on_promotion").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const storeSettingsTable = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull().default("Frootz - Doces & Salgados"),
  cnpj: text("cnpj"),
  logoUrl: text("logo_url"),
  whatsappNumber: text("whatsapp_number").notNull().default("5511999999999"),
  phoneAdditional: text("phone_additional"),
  whatsappMessage: text("whatsapp_message").notNull().default("Olá! Gostaria de fazer um pedido:"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type StoreSettings = typeof storeSettingsTable.$inferSelect;
