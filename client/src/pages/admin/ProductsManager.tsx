import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Product, InsertProduct } from "@shared/schema";
import { api } from "@shared/routes";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

export default function ProductsManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [api.products.list.path],
  });

  const { register, handleSubmit, reset, setValue } = useForm<InsertProduct>();

  const createMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await fetch(api.products.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast.success("محصول با موفقیت ایجاد شد");
      setIsDialogOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProduct> }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast.success("محصول با موفقیت به‌روزرسانی شد");
      setIsDialogOpen(false);
      setEditingProduct(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast.success("محصول با موفقیت حذف شد");
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setValue("title", product.title);
    setValue("description", product.description);
    setValue("price", product.price);
    setValue("image", product.image || "");
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("آیا از حذف این محصول اطمینان دارید؟")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: InsertProduct) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    reset();
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout title="مدیریت محصولات">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">محصولات</h2>
            <p className="text-muted-foreground">مدیریت محصولات فروشگاه</p>
          </div>
          <Button onClick={handleNewProduct}>
            <Plus className="ml-2 h-4 w-4" />
            افزودن محصول
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products?.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 space-y-3">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-md"
                  />
                )}
                <h3 className="font-semibold text-lg">{product.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(product.price)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "ویرایش محصول" : "افزودن محصول جدید"}
              </DialogTitle>
              <DialogDescription>
                اطلاعات محصول را وارد کنید
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">عنوان</Label>
                <Input id="title" {...register("title", { required: true })} />
              </div>
              <div>
                <Label htmlFor="description">توضیحات</Label>
                <Textarea id="description" {...register("description", { required: true })} />
              </div>
              <div>
                <Label htmlFor="price">قیمت (تومان)</Label>
                <Input
                  id="price"
                  type="number"
                  {...register("price", { required: true, valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="image">لینک تصویر</Label>
                <Input id="image" {...register("image")} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  {editingProduct ? "به‌روزرسانی" : "ایجاد"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
