import { AddToCartButton } from "@/components/add-to-cart-button"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type ProductDetailsPageProps = {
  params: Promise<{ id: string }>
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  const image = product.images[0] ?? null
  const isInStock = product.stock > 0

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
        Back to products
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md border bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <section className="flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground">{product.category.name}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold">{currencyFormatter.format(product.price)}</p>

          <div
            className={`mt-4 inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${
              isInStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {isInStock ? `${product.stock} in stock` : "Out of stock"}
          </div>

          <p className="mt-6 whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {product.description}
          </p>

          <AddToCartButton
            className="mt-8 w-full sm:w-fit"
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image,
              stock: product.stock,
            }}
          />
        </section>
      </div>
    </main>
  )
}
