"use client"

import { useCart } from "@/components/cart-context"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Abdo Hub
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            All Products
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("abdo-hub-open-cart"))}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border bg-background hover:bg-muted"
            aria-label="Open cart"
          >
            <ShoppingCart aria-hidden="true" className="size-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-xs font-semibold text-background">
                {itemCount}
              </span>
            ) : null}
          </button>
        </div>
      </nav>
    </header>
  )
}
