import { Link, useLocation } from "wouter";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useGetStoreSettings } from "@workspace/api-client-react";

export function Navbar() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  const { totalCount } = useCart();
  const { data: settings } = useGetStoreSettings();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} className="h-8 object-contain" alt="Logo" />
          ) : (
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl group-hover:-rotate-12 transition-transform">
              F
            </div>
          )}
          <span className="font-serif font-bold text-2xl tracking-tight text-foreground">
            {settings?.companyName ?? "Frootz"}
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          {!isAdmin && (
            <Link href="/carrinho" className="relative p-2 text-foreground hover:text-primary transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalCount > 0 && (
                <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-destructive text-destructive-foreground text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1">
                  {totalCount}
                </span>
              )}
            </Link>
          )}
          <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Área do Lojista
          </Link>
        </nav>
      </div>
    </header>
  );
}