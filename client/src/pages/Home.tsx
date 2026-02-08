import { Link } from "wouter";
import { ArrowLeft, Star, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Announcements } from "@/components/Announcements";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12 text-center relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />

      {/* Announcements Section */}
      <div className="w-full max-w-5xl px-4 animate-in fade-in slide-in-from-top-4 duration-1000">
        <Announcements />
      </div>

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-cyan-500 text-sm font-medium mb-8 animate-float shadow-lg">
        <Star className="w-4 h-4 fill-cyan-500/20" />
        <span>معتبرترین فروشگاه اکانت‌های پرمیوم</span>
      </div>

      {/* Hero Title */}
      <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-foreground">
        اشتراک‌های <span className="text-cyan-500 text-glow inline-block hover:scale-105 transition-transform duration-300">هوشمند</span> دیجیتال
      </h1>

      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
        دسترسی نامحدود به دنیای دیجیتال با بهترین قیمت و ضمانت بازگشت وجه. 
        تحویل آنی و پشتیبانی ۲۴ ساعته در پرمیوم لند.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
        <Link href="/shop">
          <Button size="lg" className="w-full sm:w-auto text-lg h-14 rounded-2xl bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)] transition-all font-bold">
            مشاهده محصولات
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Button>
        </Link>
        <Link href="/admin">
          <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 rounded-2xl border-border bg-background hover:bg-accent transition-all">
            پنل مدیریت
          </Button>
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-5xl px-4">
        {[
          { icon: Zap, title: "تحویل فوری", desc: "ارسال آنی اکانت پس از پرداخت" },
          { icon: ShieldCheck, title: "ضمانت کامل", desc: "گارانتی تا آخرین روز اشتراک" },
          { icon: Star, title: "کیفیت اصلی", desc: "اکانت‌های قانونی و اورجینال" },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center p-6 rounded-3xl bg-card border border-border hover:bg-accent/50 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <item.icon className="w-7 h-7 text-cyan-500" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
            <p className="text-muted-foreground text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
