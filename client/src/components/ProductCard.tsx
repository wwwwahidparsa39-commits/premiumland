import { ShoppingBag } from "lucide-react";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-cyan-500/50 transition-all duration-300 shadow-sm hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)] flex flex-col h-full">
      {/* Image Container with Glow Effect */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10 opacity-60" />
        <img
          src={product.image || "https://images.unsplash.com/photo-1626379953822-baec19c3accd?auto=format&fit=crop&w=800&q=80"} // Generic tech fallback
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80";
          }}
        />
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-border text-xs font-bold text-cyan-500 shadow-lg">
            پرمیوم
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-black text-foreground mb-2 line-clamp-1 group-hover:text-cyan-500 transition-colors">
          {product.title}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-6 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between gap-4 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-0.5">قیمت محصول</span>
            <div className="text-lg font-bold text-cyan-500 text-glow">
              {formatCurrency(product.price)}
              <span className="text-xs text-muted-foreground mr-1 font-medium">تومان</span>
            </div>
          </div>

          <Button
            onClick={() => onAddToCart(product)}
            className="rounded-xl bg-foreground text-background hover:bg-cyan-500 hover:text-black font-bold shadow-lg transition-all duration-300 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 ml-2" />
            افزودن
          </Button>
        </div>
      </div>
    </div>
  );
}
