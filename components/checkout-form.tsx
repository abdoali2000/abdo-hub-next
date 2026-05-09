"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/components/cart-context"
import { createOrder, type CreateOrderState } from "@/lib/actions/orders"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useRef } from "react"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const emptyOrderState: CreateOrderState = {
  success: false,
  message: "",
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null
  }

  return <p className="text-sm text-red-600">{messages[0]}</p>
}

export function CheckoutForm() {
  const router = useRouter()
  const { items, itemCount, totalPrice, clearCart } = useCart()
  const [state, formAction, pending] = useActionState(createOrder, emptyOrderState)
  const didRedirect = useRef(false)

  useEffect(() => {
    if (state.success && !didRedirect.current) {
      didRedirect.current = true
      clearCart()
      router.push(`/order-success/${state.orderId}`)
    }
  }, [clearCart, router, state])

  const cartPayload = JSON.stringify(
    items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }))
  )

  if (items.length === 0 && !state.success) {
    return (
      <div className="rounded-md border border-dashed p-10 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add products before starting checkout.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <form action={formAction} className="space-y-5 rounded-md border bg-card p-5">
        <input type="hidden" name="cartItems" value={cartPayload} />

        <div>
          <h1 className="text-2xl font-semibold">Checkout</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cash on delivery order details.</p>
        </div>

        {state.success === false && state.message ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.message}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            required
            aria-invalid={state.success === false && Boolean(state.errors?.fullName)}
          />
          {state.success === false ? <FieldError messages={state.errors?.fullName} /> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shippingAddress">Shipping Address</Label>
          <textarea
            id="shippingAddress"
            name="shippingAddress"
            required
            autoComplete="street-address"
            aria-invalid={state.success === false && Boolean(state.errors?.shippingAddress)}
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex min-h-28 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
          />
          {state.success === false ? <FieldError messages={state.errors?.shippingAddress} /> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            required
            aria-invalid={state.success === false && Boolean(state.errors?.phoneNumber)}
          />
          {state.success === false ? <FieldError messages={state.errors?.phoneNumber} /> : null}
        </div>

        {state.success === false ? <FieldError messages={state.errors?.cartItems} /> : null}

        <Button type="submit" size="lg" className="w-full" disabled={pending || itemCount === 0}>
          {pending ? "Placing Order..." : "Place Order"}
        </Button>
      </form>

      <aside className="h-fit rounded-md border bg-card p-5">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
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
              <p className="text-sm font-medium">{currencyFormatter.format(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Items</span>
            <span>{itemCount}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-medium">Total</span>
            <span className="text-xl font-semibold">{currencyFormatter.format(totalPrice)}</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Final prices and stock are verified on the server before your order is created.
          </p>
        </div>
      </aside>
    </div>
  )
}
