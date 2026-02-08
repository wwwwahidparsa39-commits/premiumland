import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useProducts,
  useCreateProduct,
  useDeleteProduct,
} from "@/hooks/use-products";
import {
  Lock,
  LogOut,
  Trash2,
  Plus,
  Loader2,
  Megaphone,
  CheckCircle2,
  XCircle,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatCurrency, cn } from "@/lib/utils";
import {
  insertProductSchema,
  insertAnnouncementSchema,
  type Announcement,
  type Product,
} from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import toast from "react-hot-toast";

// Announcement Management Component
function AnnouncementManager() {
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
    mutationFn: async (data: any) => {
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
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
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
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(
        api.announcements.delete.path.replace(":id", String(id)),
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.announcements.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.announcements.active.path] });
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

  const onSubmit = async (data: z.infer<typeof insertAnnouncementSchema>) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
        toast.success("اعلان با موفقیت ویرایش شد");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("اعلان با موفقیت ثبت شد");
      }
    } catch {
      toast.error(editingId ? "خطا در ویرایش اعلان" : "خطا در ثبت اعلان");
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
      isActive: item.isActive,
      order: item.order || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const previewUrl = form.watch("imageUrl");

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-3xl bg-card border border-border shadow-xl mb-8">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-cyan-500" />
          {editingId ? "ویرایش اعلان" : "مدیریت اعلان‌ها"}
        </h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/70">
                      عنوان اعلان (اجباری)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="مثلا: جشنواره زمستانه شروع شد"
                        {...field}
                        className="bg-background border-border"
                      />
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
                    <FormLabel className="text-foreground/70">
                      لینک تصویر (اجباری)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
                        {...field}
                        className="bg-background border-border ltr-input"
                        dir="ltr"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {previewUrl && previewUrl.startsWith("http") && (
              <div className="mt-2 p-4 rounded-xl border border-border bg-background flex flex-col items-center gap-2">
                <span className="text-xs text-foreground/50">پیش‌نمایش تصویر:</span>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-32 rounded-lg object-cover border border-border"
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/70">توضیحات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="متن اعلان..."
                      {...field}
                      value={field.value ?? ""}
                      className="bg-background border-border min-h-[80px]"
                    />
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
                    <FormLabel className="text-foreground/70">متن دکمه</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="مشاهده"
                        {...field}
                        value={field.value || ""}
                        className="bg-background border-border"
                      />
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
                    <FormLabel className="text-foreground/70">لینک دکمه</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
                        {...field}
                        value={field.value || ""}
                        className="bg-background border-border ltr-input"
                        dir="ltr"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-cyan-500 text-black hover:bg-cyan-400 font-bold"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  editingId ? "بروزرسانی اعلان" : "ثبت اعلان جدید"
                )}
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

      {/* Announcements List */}
      <div className="rounded-3xl bg-card border border-border shadow-xl overflow-hidden mb-12">
        <div className="p-6 border-b border-border bg-card/50">
          <h2 className="text-xl font-bold text-foreground">
            لیست اعلان‌ها ({announcements?.length || 0})
          </h2>
        </div>

        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-500" />
            </div>
          ) : announcements?.length === 0 ? (
            <div className="p-8 text-center text-foreground/50">
              هیچ اعلانی ثبت نشده است
            </div>
          ) : (
            announcements?.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col md:flex-row items-center gap-4 hover:bg-accent/50 transition-colors"
              >
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-24 h-16 rounded-lg object-cover shrink-0 border border-border"
                />

                <div className="flex-1 min-w-0 text-right">
                  <h3 className="font-bold text-foreground truncate">{item.title}</h3>
                  <p className="text-xs text-foreground/50 truncate">{item.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleMutation.mutate({ id: item.id, isActive: !item.isActive })
                    }
                    className={cn(
                      "rounded-lg gap-2",
                      item.isActive
                        ? "text-green-500 hover:bg-green-500/10"
                        : "text-foreground/50 hover:bg-foreground/10"
                    )}
                  >
                    {item.isActive ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {item.isActive ? "فعال" : "غیرفعال"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(item)}
                    className="text-foreground/50 hover:text-cyan-500 hover:bg-cyan-500/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("آیا از حذف این اعلان اطمینان دارید؟")) {
                        toast.promise(deleteMutation.mutateAsync(item.id), {
                          loading: "در حال حذف...",
                          success: "اعلان حذف شد",
                          error: "خطا در حذف",
                        });
                      }
                    }}
                    className="text-foreground/50 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Login Component
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pass === "Wahid2026#$") {
      onLogin();
    } else {
      setError(true);
      setPass("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-xs p-8 rounded-3xl bg-card border border-border shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-cyan-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground text-center mb-6">
          ورود به پنل مدیریت
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="رمز عبور"
            className="bg-background border-border text-center tracking-widest"
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              setError(false);
            }}
          />
          {error && (
            <p className="text-red-500 text-xs text-center font-bold">
              رمز عبور اشتباه است
            </p>
          )}
          <Button
            type="submit"
            className="w-full bg-cyan-500 text-black hover:bg-cyan-400 font-bold"
          >
            ورود
          </Button>
        </form>
      </div>
    </div>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Main Admin Component
export default function Admin() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("adminAuthenticated") === "true";
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data: products } = useProducts();
  const createMutation = useCreateProduct();
  const deleteMutation = useDeleteProduct();

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("adminAuthenticated", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
  };

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingId(null);
      form.reset();
    },
  });

  const formSchema = insertProductSchema.extend({
    price: z.coerce.number().min(1, "قیمت باید بیشتر از ۰ باشد"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      image: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (editingId) {
        await updateProductMutation.mutateAsync({ id: editingId, data });
        toast.success("محصول با موفقیت ویرایش شد");
      } else {
        await createMutation.mutateAsync(data);
        form.reset();
        toast.success("محصول جدید با موفقیت اضافه شد");
      }
    } catch {
      toast.error(editingId ? "خطا در ویرایش محصول" : "خطا در ثبت محصول");
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    form.reset({
      title: product.title,
      description: product.description || "",
      price: product.price,
      image: product.image || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-foreground">پنل مدیریت</h1>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
        >
          <LogOut className="w-4 h-4 ml-2" />
          خروج
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-8">
        <TabsList className="bg-card border border-border p-1 rounded-2xl w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="products" className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
            مدیریت محصولات
          </TabsTrigger>
          <TabsTrigger value="announcements" className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
            مدیریت اعلان‌ها
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <AnnouncementManager />
        </TabsContent>

        <TabsContent value="products">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add/Edit Product Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-3xl bg-card border border-border shadow-xl">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-cyan-500" />
                  {editingId ? "ویرایش محصول" : "افزودن محصول"}
                </h2>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/70">عنوان محصول</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="مثلا: اشتراک یک ماهه اسپاتیفای"
                              {...field}
                              className="bg-background border-border"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/70">قیمت (تومان)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              className="bg-background border-border"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/70">لینک تصویر</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://..."
                              value={field.value || ""}
                              onChange={field.onChange}
                              className="bg-background border-border ltr-input text-left"
                              dir="ltr"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/70">توضیحات</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="ویژگی‌های محصول..."
                              {...field}
                              value={field.value ?? ""}
                              className="bg-background border-border min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || updateProductMutation.isPending}
                        className="flex-1 bg-cyan-500 text-black hover:bg-cyan-400 font-bold"
                      >
                        {(createMutation.isPending || updateProductMutation.isPending) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          editingId ? "بروزرسانی محصول" : "افزودن محصول"
                        )}
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
            </div>

            {/* Product List */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl bg-card border border-border shadow-xl overflow-hidden">
                <div className="p-6 border-b border-border bg-card/50">
                  <h2 className="text-xl font-bold text-foreground">
                    لیست محصولات ({products?.length || 0})
                  </h2>
                </div>

                <div className="divide-y divide-border">
                  {products?.length === 0 ? (
                    <div className="p-8 text-center text-foreground/50">
                      هیچ محصولی ثبت نشده است
                    </div>
                  ) : (
                    products?.map((product) => (
                      <div
                        key={product.id}
                        className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="w-16 h-16 rounded-lg bg-background overflow-hidden shrink-0 border border-border">
                          {product.image && (
                            <img
                              src={product.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 text-right">
                          <h3 className="font-bold text-foreground truncate">
                            {product.title}
                          </h3>
                          <div className="text-cyan-500 text-sm">
                            {formatCurrency(product.price)} تومان
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(product)}
                            className="text-foreground/50 hover:text-cyan-500 hover:bg-cyan-500/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              if (confirm("آیا از حذف این محصول اطمینان دارید؟")) {
                                const promise = new Promise((resolve, reject) => {
                                  deleteMutation.mutate(product.id, {
                                    onSuccess: () => resolve(true),
                                    onError: (err) => reject(err),
                                  });
                                });

                                toast.promise(promise, {
                                  loading: "در حال حذف...",
                                  success: "محصول حذف شد",
                                  error: "خطا در حذف محصول",
                                });
                              }
                            }}
                            className="text-foreground/50 hover:text-red-500 hover:bg-red-500/10"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
