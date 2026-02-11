import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Announcement, insertAnnouncementSchema } from "@shared/schema";
import { api } from "@shared/routes";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function AnnouncementsManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: [api.announcements.list.path],
  });

  const form = useForm<z.infer<typeof insertAnnouncementSchema>>({
    resolver: zodResolver(insertAnnouncementSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      buttonText: "",
      buttonLink: "",
      isActive: true,
      order: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertAnnouncementSchema>) => {
      const res = await fetch(api.announcements.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.announcements.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.announcements.active.path] });
      form.reset();
      toast.success("اعلان با موفقیت ایجاد شد");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof insertAnnouncementSchema> }) => {
      const res = await fetch(api.announcements.update.path.replace(":id", String(id)), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.announcements.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.announcements.active.path] });
      setEditingId(null);
      form.reset();
      toast.success("اعلان با موفقیت به‌روزرسانی شد");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(
        api.announcements.delete.path.replace(":id", String(id)),
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.announcements.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.announcements.active.path] });
      toast.success("اعلان با موفقیت حذف شد");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetch(
        api.announcements.update.path.replace(":id", String(id)),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        }
      );
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.announcements.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.announcements.active.path] });
    },
  });

  const onSubmit = (data: z.infer<typeof insertAnnouncementSchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (item: Announcement) => {
    setEditingId(item.id);
    form.reset({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      buttonText: item.buttonText || "",
      buttonLink: item.buttonLink || "",
      isActive: item.isActive || true,
      order: item.order || 0,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("آیا از حذف این اعلان اطمینان دارید؟")) {
      deleteMutation.mutate(id);
    }
  };

  const previewUrl = form.watch("imageUrl");

  return (
    <AdminLayout title="مدیریت اعلانات">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">اعلانات</h2>
          <p className="text-muted-foreground">مدیریت اعلان‌های صفحه اصلی</p>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? "ویرایش اعلان" : "افزودن اعلان جدید"}
          </h3>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان</FormLabel>
                      <FormControl>
                        <Input placeholder="عنوان اعلان" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>لینک تصویر</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>توضیحات</FormLabel>
                    <FormControl>
                      <Textarea placeholder="توضیحات اعلان" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="buttonText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>متن دکمه</FormLabel>
                      <FormControl>
                        <Input placeholder="مشاهده بیشتر" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buttonLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>لینک دکمه</FormLabel>
                      <FormControl>
                        <Input placeholder="/shop" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ترتیب نمایش</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel>وضعیت</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {field.value ? "فعال" : "غیرفعال"}
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {previewUrl && (
                <div>
                  <p className="text-sm font-medium mb-2">پیش‌نمایش تصویر:</p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? "به‌روزرسانی" : "ایجاد"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      form.reset();
                    }}
                  >
                    انصراف
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {announcements?.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <div className="flex items-center gap-2">
                        {item.isActive ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(item)}
                      >
                        <Pencil className="h-4 w-4 ml-1" />
                        ویرایش
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMutation.mutate({ id: item.id, isActive: !item.isActive })}
                      >
                        {item.isActive ? "غیرفعال" : "فعال"} کردن
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
