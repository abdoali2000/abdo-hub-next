import { auth } from "@/auth"
import { OrderDetailsDialog } from "@/app/dashboard/orders/order-details-dialog"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

export default async function SellerOrdersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const role = session.user.role

  if (role !== "SELLER" && role !== "ADMIN") {
    redirect("/dashboard")
  }

  const isAdmin = role === "ADMIN"
  const orders = await prisma.order.findMany({
    where: isAdmin
      ? undefined
      : {
          items: {
            some: {
              product: {
                sellerId: session.user.id,
              },
            },
          },
        },
    include: {
      items: {
        where: isAdmin
          ? undefined
          : {
              product: {
                sellerId: session.user.id,
              },
            },
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const visibleOrders = orders.map((order) => {
    const sellerTotal = order.items.reduce((total, item) => total + item.price * item.quantity, 0)

    return {
      id: order.id,
      customerName: order.customerName,
      shippingAddress: order.shippingAddress,
      phoneNumber: order.phoneNumber,
      totalAmount: isAdmin ? order.totalAmount : sellerTotal,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review incoming orders, shipping details, and purchased items.
        </p>
      </div>

      {visibleOrders.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          No orders have been placed yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order ID</th>
                <th className="px-4 py-3 text-left font-medium">Customer Name</th>
                <th className="px-4 py-3 text-left font-medium">Total Price</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{order.id}</td>
                  <td className="px-4 py-3">{order.customerName || "Not provided"}</td>
                  <td className="px-4 py-3">{currencyFormatter.format(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{order.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{dateFormatter.format(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <OrderDetailsDialog order={order} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
