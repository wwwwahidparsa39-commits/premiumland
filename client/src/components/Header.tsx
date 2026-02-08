import { Link, useLocation } from "wouter";
import { ShoppingBag, Lock, Star, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  cartCount: number;
}

export function Header({ cartCount }: HeaderProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { href: "/", label: "خانه" },
    { href: "/shop", label: "فروشگاه" },
    { href: "https://t.me/permumland", label: "پشتیبانی", external: true },
  ];

  const NavItem = ({ item, mobile = false }: { item: typeof navLinks[0], mobile?: boolean }) => {
    const isActive = location === item.href;
    const Component = item.external ? "a" : Link;
    
    return (
      <Component
        href={item.href}
        target={item.external ? "_blank" : undefined}
        className={cn(
          "relative px-4 py-2 font-medium transition-colors duration-200 rounded-lg group",
          isActive 
            ? "text-cyan-400 bg-cyan-400/10" 
            : "text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10",
          mobile && "w-full text-right"
        )}
      >
        {item.label}
        {isActive && !mobile && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_theme('colors.cyan.400')]" />
        )}
      </Component>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl transition-colors duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-l border-border bg-card">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <NavItem key={link.href} item={link} mobile />
                ))}
              </div>
            </SheetContent>
          </Sheet>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground/70 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl w-10 h-10"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 group-hover:border-cyan-500/50 transition-colors">
            <Star className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-foreground group-hover:text-cyan-500 transition-colors">
              Premium Land
            </span>
            <span className="text-[10px] text-cyan-500/70 font-medium">نسخه تحت وب</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <NavItem key={link.href} item={link} />
          ))}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground/70 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl w-10 h-10 ml-2"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground/70 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl w-12 h-12"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-black shadow-[0_0_10px_theme('colors.cyan.500')]">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          
          <Link href="/admin">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl w-12 h-12"
            >
              <Lock className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
