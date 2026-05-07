import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useListProducts, useListCategories, useGetStoreSettings } from "@workspace/api-client-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageOpen, Flame } from "lucide-react";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  const { data: products, isLoading: isLoadingProducts } = useListProducts();
  const { data: settings } = useGetStoreSettings();

  useEffect(() => {
    document.title = settings?.companyName ?? "Frootz";
  }, [settings?.companyName]);

  const filteredProducts = products?.filter(p => p.active !== false && (activeCategory === "all" || p.categoryId?.toString() === activeCategory));
  const featuredProducts = products?.filter(p => p.active !== false && p.featured);
  const promoProducts = products?.filter(p => p.active !== false && p.onPromotion);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary/5 py-12 md:py-20 border-b border-primary/10">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold font-serif text-foreground leading-tight mb-4">
                Sabor que <span className="text-primary">desperta</span> a alegria.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Doces artesanais, salgados quentinhos e combos perfeitos para qualquer momento do seu dia.
              </p>
            </div>
          </div>
        </section>

        {/* Promo Section */}
        {promoProducts && promoProducts.length > 0 && (
          <section className="py-12 bg-destructive/5">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold font-serif text-destructive mb-6 flex items-center gap-2">
                <Flame className="w-8 h-8" /> Ofertas Irresistíveis
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {promoProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Section */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold font-serif text-foreground mb-6">
                Destaques da Casa
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Full Catalog Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold font-serif text-foreground">
                Nosso Cardápio
              </h2>
              
              {!isLoadingCategories && categories && (
                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full md:w-auto overflow-x-auto">
                  <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-max min-w-full">
                    <TabsTrigger value="all" className="px-4 py-1.5">Todos</TabsTrigger>
                    {categories.map(cat => (
                      <TabsTrigger key={cat.id} value={cat.id.toString()} className="px-4 py-1.5">
                        {cat.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
            </div>

            {isLoadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                ))}
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <PackageOpen className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground max-w-md">
                  Ainda não temos produtos nesta categoria. Volte mais tarde para novidades!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="w-12 h-12 rounded bg-primary mx-auto flex items-center justify-center text-primary-foreground font-bold text-2xl mb-4 overflow-hidden">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              "F"
            )}
          </div>
          <p className="font-serif font-bold text-xl mb-4">{settings?.companyName ?? "Frootz - Doces & Salgados"}</p>
          <p className="text-background/60 text-sm">
            &copy; {new Date().getFullYear()} {settings?.companyName ?? "Frootz"}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}