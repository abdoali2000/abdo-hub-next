"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-context"
import { Trash2, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function CartDrawer() {
  const { items, itemCount, totalPrice, removeItem, clearCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function openCart() {
      setIsOpen(true)
    }

    window.addEventListener("abdo-hub-open-cart", openCart)

    return () => {
      window.removeEventListener("abdo-hub-open-cart", openCart)
    }
  }, [])

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="Close cart"
            onClick={() => setIsOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Cart</h2>
                <p className="text-sm text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"} | {currencyFormatter.format(totalPrice)}
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X aria-hidden="true" />
                <span className="sr-only">Close cart</span>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Your cart is empty.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-md border p-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {currencyFormatter.format(item.price)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 aria-hidden="true" />
                        <span className="sr-only">Remove {item.name}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t p-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="text-lg font-semibold">{currencyFormatter.format(totalPrice)}</span>
              </div>
              <Button asChild className="w-full" disabled={items.length === 0}>
                <Link href="/checkout" onClick={() => setIsOpen(false)}>
                  Checkout
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full"
                onClick={clearCart}
                disabled={items.length === 0}
              >
                <Trash2 aria-hidden="true" />
                Clear Cart
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  )
}
