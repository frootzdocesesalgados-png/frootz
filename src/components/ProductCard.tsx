import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@workspace/api-client-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full hover-elevate transition-all duration-300 group border-border/50 hover:border-primary/50">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary-foreground/40">
            <span className="font-serif italic">Sem imagem</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.onPromotion && (
            <Badge className="bg-destructive text-destructive-foreground font-bold shadow-md">
              PROMOÇÃO
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-secondary text-secondary-foreground font-bold shadow-md">
              DESTAQUE
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-bold text-lg font-serif leading-tight text-foreground line-clamp-2">
              {product.name}
            </h3>
          </div>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {product.description}
            </p>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between mb-4">
          <div className="flex flex-col">
            {product.onPromotion && product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="font-bold text-xl text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
        <Button 
          className={`w-full mt-auto font-bold transition-colors ${added ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
          onClick={handleAdd}
        >
          {added ? "Adicionado!" : "Adicionar ao Carrinho"}
        </Button>
      </CardContent>
    </Card>
  );
}