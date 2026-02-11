import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  Megaphone,
  Settings,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "داشبورد",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "محصولات",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "دسته‌بندی‌ها",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "سفارشات",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "اعلانات",
    href: "/admin/announcements",
    icon: Megaphone,
  },
  {
    title: "تنظیمات",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-l border-border bg-card h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </a>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
