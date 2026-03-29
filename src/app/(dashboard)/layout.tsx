"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/campaigns/new", label: "New Campaign", icon: "➕" },
  { href: "/templates", label: "Templates", icon: "✉️" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex flex-1 min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">LeadPipe</span>
            <Badge variant="secondary" className="text-xs">AI</Badge>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-muted-foreground"
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden border-b p-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">LeadPipe</span>
            <Badge variant="secondary" className="text-xs">AI</Badge>
          </Link>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  size="sm"
                >
                  {item.icon}
                </Button>
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
