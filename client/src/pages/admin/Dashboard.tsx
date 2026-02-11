import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { StatsCard } from "@/components/admin/StatsCard";
import { Package, Megaphone, ShoppingCart, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalProducts: number;
  activeAnnouncements: number;
  totalOrders: number;
  revenueToday: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  return (
    <AdminLayout title="داشبورد">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">خوش آمدید</h2>
          <p className="text-muted-foreground">
            خلاصه‌ای از وضعیت فروشگاه شما
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </>
          ) : stats ? (
            <>
              <StatsCard
                title="کل محصولات"
                value={stats.totalProducts}
                icon={Package}
                description="تعداد کل محصولات"
              />
              <StatsCard
                title="اعلانات فعال"
                value={stats.activeAnnouncements}
                icon={Megaphone}
                description="اعلانات نمایش داده شده"
              />
              <StatsCard
                title="کل سفارشات"
                value={stats.totalOrders}
                icon={ShoppingCart}
                description="تعداد کل سفارشات"
              />
              <StatsCard
                title="درآمد امروز"
                value={formatCurrency(stats.revenueToday)}
                icon={DollarSign}
                description="درآمد امروز"
              />
            </>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">اقدامات سریع</h3>
            <div className="space-y-2">
              <a
                href="/admin/products"
                className="block p-3 rounded-md hover:bg-accent transition-colors"
              >
                افزودن محصول جدید
              </a>
              <a
                href="/admin/announcements"
                className="block p-3 rounded-md hover:bg-accent transition-colors"
              >
                افزودن اعلان جدید
              </a>
              <a
                href="/admin/orders"
                className="block p-3 rounded-md hover:bg-accent transition-colors"
              >
                مشاهده سفارشات
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
