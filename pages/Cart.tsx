import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "wouter";
import { Trash2, Plus, Minus, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { useGetStoreSettings } from "@workspace/api-client-react";

export default function Cart() {
  const { data: settings } = useGetStoreSettings();
  const whatsappNumber = settings?.whatsappNumber ?? "5511999999999";
  const whatsappMessagePrefix = settings?.whatsappMessage ?? "Olá! Gostaria de fazer um pedido:";

  const { cart, removeFromCart, updateQuantity, totalPrice, totalCount } = useCart();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleCheckout = () => {
    if (!nome || !telefone || !endereco) {
      alert("Por favor, preencha todos os campos do formulário.");
      return;
    }

    let itemsText = "";
    cart.forEach(item => {
      itemsText += `\n• ${item.product.name} x${item.quantity} — ${formatPrice(item.product.price * item.quantity)}`;
    });

    const message = `${whatsappMessagePrefix}

*Nome:* ${nome}
*Telefone:* ${telefone}
*Endereço:* ${endereco}

*Itens do Pedido:*${itemsText}

*Total: ${formatPrice(totalPrice)}*

Aguardo confirmação!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-serif mb-8 text-foreground">Carrinho de Compras</h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <PackageOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Seu carrinho está vazio</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Adicione produtos deliciosos ao seu carrinho para finalizar seu pedido!
            </p>
            <Link href="/">
              <Button size="lg" className="bg-primary text-primary-foreground">
                Ver Produtos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.product.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4">
                    <div className="w-full sm:w-24 h-24 rounded-md overflow-hidden bg-muted shrink-0">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Sem img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg leading-tight truncate">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.product.categoryName || "Produto"}</p>
                      <p className="font-bold text-primary">{formatPrice(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center border border-input rounded-md">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.product.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Seus Dados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="João Silva" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone com DDD</Label>
                    <Input id="telefone" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço de Entrega</Label>
                    <Input id="endereco" value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua das Flores, 123" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Itens ({totalCount})</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-4 border-t border-border mt-4">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white" size="lg" onClick={handleCheckout}>
                    Finalizar via WhatsApp
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
