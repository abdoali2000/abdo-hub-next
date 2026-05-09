import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

type OrderSuccessPageProps = {
  params: Promise<{ orderId: string }>
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const { orderId } = await params
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  if (!order || order.userId !== session.user.id) {
    notFound()
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full rounded-md border bg-card p-6 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-green-700">Order placed</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Thank you for your order.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your order is pending and will be paid by cash on delivery.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-md bg-muted/50 p-4 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-medium">{order.id}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">{order.status}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">{currencyFormatter.format(order.totalAmount)}</span>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-md space-y-2 text-left">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span>{item.product.name}</span>
              <span className="text-muted-foreground">
                {item.quantity} x {currencyFormatter.format(item.price)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
