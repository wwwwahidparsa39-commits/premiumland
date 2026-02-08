import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { ProductCard } from "@/components/ProductCard";
import { Search, Loader2, PackageOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function Shop() {
  const { data: products, isLoading, error } = useProducts();
  const { addToCart } = useCart();
  const [search, setSearch] = useState("");

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success("به سبد خرید اضافه شد", {
      icon: '🛒',
      style: {
        borderRadius: '12px',
        background: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        border: '1px solid hsl(var(--border))'
      },
    });
  };

  const filteredProducts = products?.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-12">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2">فروشگاه محصولات</h1>
          <p className="text-muted-foreground">بهترین اشتراک‌ها با قیمت‌های رقابتی</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی محصول..." 
            className="w-full h-12 pr-12 pl-4 bg-card border-border rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20 text-right"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-cyan-500" />
          <p>در حال بارگذاری محصولات...</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-center text-destructive">
          <p>خطا در دریافت محصولات. لطفا دوباره تلاش کنید.</p>
        </div>
      ) : filteredProducts?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card rounded-3xl border border-border border-dashed">
          <PackageOpen className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">هیچ محصولی یافت نشد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts?.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={handleAddToCart} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
