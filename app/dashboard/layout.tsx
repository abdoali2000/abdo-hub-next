import { auth } from "@/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Boxes, House, PackageCheck, PackagePlus, UserCircle2, Users } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

type DashboardLayoutProps = {
  children: React.ReactNode
}

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const role = session.user.role
  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Home", icon: House },
    { href: "/dashboard/profile", label: "Profile", icon: UserCircle2 },
  ]

  if (role === "SELLER" || role === "ADMIN") {
    navItems.push(
      { href: "/dashboard/products/new", label: "Add Product", icon: PackagePlus },
      { href: "/dashboard", label: "My Products", icon: Boxes },
      { href: "/dashboard/orders", label: "Orders", icon: PackageCheck }
    )
  }

  if (role === "ADMIN") {
    navItems.push({ href: "/admin", label: "Users Management", icon: Users })
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-6 p-6">
      <aside className="w-full max-w-xs">
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle>Navigation</CardTitle>
            <Badge variant="secondary" className="w-fit">
              role: {role}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button key={`${item.href}-${item.label}`} variant="ghost" className="w-full justify-start" asChild>
                  <Link href={item.href}>
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              )
            })}
          </CardContent>
        </Card>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
