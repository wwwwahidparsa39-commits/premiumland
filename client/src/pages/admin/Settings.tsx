import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  return (
    <AdminLayout title="تنظیمات">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">تنظیمات</h2>
          <p className="text-muted-foreground">
            تنظیمات پنل مدیریت
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تنظیمات پنل</CardTitle>
            <CardDescription>
              تنظیمات و پیکربندی پنل مدیریت
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              صفحه تنظیمات در نسخه‌های آینده اضافه خواهد شد.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
