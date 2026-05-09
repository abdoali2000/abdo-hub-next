import { ProductCatalog, type PublicProduct } from "@/components/product-catalog"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
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
    }),
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ])

  const publicProducts: PublicProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    image: product.images[0] ?? null,
    category: product.category,
  }))

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Abdo Hub
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Browse the latest products and add your picks to the cart.
          </p>
        </div>
      </div>

      <ProductCatalog products={publicProducts} categories={categories} />
    </main>
  )
}
