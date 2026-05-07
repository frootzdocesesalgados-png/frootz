import { useAuth } from "@/hooks/use-auth";
import AdminLayout from "@/components/layout/AdminLayout";
import { useGetProductStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Star, Tag, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user && !isAuthLoading) {
      setLocation("/admin");
    }
  }, [user, isAuthLoading, setLocation]);

  const { data: stats, isLoading: isStatsLoading } = useGetProductStats({
    query: {
      enabled: !!user,
    }
  });

  if (isAuthLoading) return <div>Carregando...</div>;
  if (!user) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral dos seus produtos e catálogo.</p>
        </div>

        {isStatsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ativos</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.active}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Em Promoção</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.onPromotion}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Destaques</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{stats.featured}</div>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">Por Categoria</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.byCategory.map((cat, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">{cat.categoryName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{cat.count}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}