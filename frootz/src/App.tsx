import { lazy, Suspense, Component, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";

// Public pages — loaded eagerly (part of initial bundle)
import Home from "@/pages/Home";
import Cart from "@/pages/Cart";
import NotFound from "@/pages/not-found";

// Admin pages — lazy loaded so they don't bloat the public storefront bundle
const Login = lazy(() => import("@/pages/admin/Login"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Products = lazy(() => import("@/pages/admin/Products"));
const Categories = lazy(() => import("@/pages/admin/Categories"));
const Settings = lazy(() => import("@/pages/admin/Settings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Error boundary prevents white screens from uncaught render errors
interface ErrorBoundaryState { hasError: boolean; message: string }
class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: "" };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Algo deu errado</h1>
            <p className="text-muted-foreground mb-4">{this.state.message}</p>
            <button
              className="px-4 py-2 bg-primary text-white rounded"
              onClick={() => { this.setState({ hasError: false, message: "" }); window.location.reload(); }}
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-muted-foreground">Carregando painel...</div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/carrinho" component={Cart} />
      <Route path="/admin">
        <Suspense fallback={<AdminFallback />}>
          <Login />
        </Suspense>
      </Route>
      <Route path="/admin/dashboard">
        <Suspense fallback={<AdminFallback />}>
          <Dashboard />
        </Suspense>
      </Route>
      <Route path="/admin/products">
        <Suspense fallback={<AdminFallback />}>
          <Products />
        </Suspense>
      </Route>
      <Route path="/admin/categories">
        <Suspense fallback={<AdminFallback />}>
          <Categories />
        </Suspense>
      </Route>
      <Route path="/admin/settings">
        <Suspense fallback={<AdminFallback />}>
          <Settings />
        </Suspense>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </CartProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
