import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Header } from "@/components/Header";
import { useCart } from "@/hooks/use-cart";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Cart from "@/pages/Cart";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background font-sans" dir="rtl">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/shop" component={Shop} />
        <Route path="/cart" component={Cart} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function AppContent() {
  const { count } = useCart();
  
  return (
    <>
      <Header cartCount={count} />
      <main className="container mx-auto px-4">
        <Router />
      </main>
      <Toaster position="top-right" />
      <footer className="border-t border-slate-900 mt-20 py-8 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-black text-white mb-2">Premium Land</h2>
          <p className="text-slate-500 text-sm">
            تمامی حقوق برای پرمیوم لند محفوظ است © ۱۴۰۳
          </p>
        </div>
      </footer>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
