import { AddToCartButton } from "@/components/add-to-cart-button"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"

export const dynamic = "force-dynamic"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({
    take: 4,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <main className="flex-1">
      <section className="border-b bg-muted/35">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Simple shopping, curated products
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Find your next favorite product at Abdo Hub.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Browse fresh products, add them to your cart, and move between the storefront and dashboard without friction.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/products">Shop Now</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.slice(0, 4).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group overflow-hidden rounded-md border bg-background"
              >
                <div className="relative aspect-square bg-muted">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 250px, 50vw"
                      className="object-cover transition duration-200 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured Products</h2>
            <p className="mt-2 text-sm text-muted-foreground">The newest products from the catalog.</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
            No products have been added yet.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const image = product.images[0] ?? null

              return (
                <article key={product.id} className="overflow-hidden rounded-md border bg-card">
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="relative aspect-[4/3] bg-muted">
                      {image ? (
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="space-y-3 p-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {product.category.name}
                      </p>
                      <h3 className="mt-1 line-clamp-1 font-semibold">{product.name}</h3>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{currencyFormatter.format(product.price)}</p>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        Details
                      </Link>
                    </div>
                    <AddToCartButton
                      className="w-full"
                      product={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image,
                        stock: product.stock,
                      }}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
