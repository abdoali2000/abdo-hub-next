"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

type OrderDetailItem = {
  id: string
  name: string
  quantity: number
  price: number
}

type OrderDetailsDialogProps = {
  order: {
    id: string
    customerName: string
    shippingAddress: string
    phoneNumber: string
    items: OrderDetailItem[]
  }
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function OrderDetailsDialog({ order }: OrderDetailsDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        View Details
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`order-${order.id}-title`}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border bg-background p-6 shadow-xl"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Order Details</p>
                <h2 id={`order-${order.id}-title`} className="mt-1 text-xl font-semibold">
                  {order.id}
                </h2>
              </div>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border p-4">
                <p className="text-sm font-medium">Customer</p>
                <p className="mt-2 text-sm text-muted-foreground">{order.customerName || "Not provided"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{order.phoneNumber || "No phone number"}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-sm font-medium">Shipping Address</p>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                  {order.shippingAddress || "No address provided"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium">Items</h3>
              <div className="mt-3 overflow-x-auto rounded-md border">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Product</th>
                      <th className="px-4 py-3 text-left font-medium">Quantity</th>
                      <th className="px-4 py-3 text-left font-medium">Price</th>
                      <th className="px-4 py-3 text-left font-medium">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">{currencyFormatter.format(item.price)}</td>
                        <td className="px-4 py-3">{currencyFormatter.format(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
