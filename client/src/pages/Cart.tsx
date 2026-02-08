import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Minus, Plus, Trash2, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import toast from "react-hot-toast";

export default function Cart() {
  const { cart, updateQty, removeFromCart, total, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mb-6">
          <Trash2 className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">سبد خرید شما خالی است</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          به نظر می‌رسد هنوز محصولی انتخاب نکرده‌اید. به فروشگاه بروید و بهترین‌ها را انتخاب کنید.
        </p>
        <Link href="/shop">
          <Button size="lg" className="bg-cyan-500 text-black hover:bg-cyan-400">
            بازگشت به فروشگاه
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/shop">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-black text-foreground">سبد خرید</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                <img 
                  src={item.image || ""} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate mb-1">{item.title}</h3>
                <div className="text-cyan-500 font-medium text-sm">
                  {formatCurrency(item.price)} تومان
                </div>
              </div>

              <div className="flex items-center gap-3 bg-background rounded-xl p-1 border border-border">
                <button 
                  onClick={() => updateQty(item.id, 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="w-4 text-center font-bold text-foreground text-sm">{item.q}</span>
                <button 
                  onClick={() => updateQty(item.id, -1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={() => removeFromCart(item.id)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shrink-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 rounded-3xl bg-card border border-border shadow-md">
            <h3 className="text-lg font-bold text-foreground mb-6">خلاصه سفارش</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>تعداد اقلام</span>
                <span>{cart.reduce((a, b) => a + b.q, 0)} عدد</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>تخفیف</span>
                <span className="text-cyan-500">0 تومان</span>
              </div>
              <div className="w-full h-px bg-border my-4" />
              <div className="flex justify-between items-end">
                <span className="font-bold text-foreground">مبلغ قابل پرداخت</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-cyan-500 block">{formatCurrency(total)}</span>
                  <span className="text-xs text-muted-foreground">تومان</span>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full h-12 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 font-bold shadow-lg shadow-cyan-500/20"
              onClick={() => setShowCheckout(true)}
            >
              تکمیل خرید
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center text-foreground mb-2">نهایی کردن سفارش</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground leading-relaxed">
              برای تکمیل خرید و دریافت آنی اکانت، به درگاه امن تلگرام ما هدایت می‌شوید. پشتیبانی ما ۲۴ ساعته در کنار شماست.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-6">
            <a 
              href="https://t.me/permumland" 
              target="_blank" 
              rel="noreferrer"
              onClick={() => {
                clearCart();
                toast.success("سفارش شما ثبت شد. در حال هدایت به تلگرام...", {
                  duration: 4000,
                  style: {
                    borderRadius: '12px',
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    border: '1px solid hsl(var(--border))'
                  }
                });
              }}
              className="w-full"
            >
              <Button className="w-full h-12 rounded-xl bg-[#229ED9] hover:bg-[#1e8qb4] text-white font-bold text-lg gap-2">
                <ExternalLink className="w-5 h-5" />
                ورود به تلگرام
              </Button>
            </a>
            <Button variant="ghost" onClick={() => setShowCheckout(false)} className="text-muted-foreground">
              انصراف
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
