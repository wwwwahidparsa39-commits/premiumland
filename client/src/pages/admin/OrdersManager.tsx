import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Order } from "@shared/schema";
import { api } from "@shared/routes";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "در انتظار",
  confirmed: "تایید شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
};

export default function OrdersManager() {
  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery<{ data: Order[]; total: number }>({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update order status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast.success("وضعیت سفارش به‌روزرسانی شد");
    },
  });

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  return (
    <AdminLayout title="مدیریت سفارشات">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">سفارشات</h2>
          <p className="text-muted-foreground">مدیریت و پیگیری سفارشات مشتریان</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : result && result.data.length > 0 ? (
          <div className="space-y-4">
            {result.data.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">سفارش #{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt!).toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium">نام مشتری</p>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">شماره تماس</p>
                    <p className="text-sm text-muted-foreground" dir="ltr">{order.customerPhone}</p>
                  </div>
                  {order.customerEmail && (
                    <div>
                      <p className="text-sm font-medium">ایمیل</p>
                      <p className="text-sm text-muted-foreground" dir="ltr">{order.customerEmail}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">مجموع</p>
                    <p className="text-sm font-bold text-primary">{formatCurrency(order.total)}</p>
                  </div>
                </div>

                {order.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">یادداشت</p>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">در انتظار</SelectItem>
                      <SelectItem value="confirmed">تایید شده</SelectItem>
                      <SelectItem value="delivered">تحویل داده شده</SelectItem>
                      <SelectItem value="cancelled">لغو شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground">هنوز سفارشی ثبت نشده است</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
