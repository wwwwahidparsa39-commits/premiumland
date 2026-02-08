import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full animate-pulse" />
        <Ghost className="w-32 h-32 text-slate-700 relative z-10" />
      </div>
      
      <h1 className="text-9xl font-black text-slate-800/50 mt-4 mb-8">404</h1>
      <h2 className="text-2xl font-bold text-white mb-4">صفحه مورد نظر پیدا نشد</h2>
      <p className="text-slate-400 mb-8 max-w-sm">
        متاسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
      </p>

      <Link href="/">
        <Button size="lg" className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold">
          بازگشت به صفحه اصلی
        </Button>
      </Link>
    </div>
  );
}
