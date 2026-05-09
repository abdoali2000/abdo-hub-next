"use client"

import { AddToCartButton } from "@/components/add-to-cart-button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"

export type PublicProduct = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image: string | null
  category: {
    id: string
    name: string
  }
}

type ProductCatalogProps = {
  products: PublicProduct[]
  categories: Array<{
    id: string
    name: string
  }>
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function ProductCatalog({ products, categories }: ProductCatalogProps) {
  const [query, setQuery] = useState("")
  const [categoryId, setCategoryId] = useState("all")

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery)
      const matchesCategory = categoryId === "all" || product.category.id === categoryId

      return matchesSearch && matchesCategory
    })
  }, [categoryId, products, query])

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            className="pl-9"
            aria-label="Search products"
          />
        </div>

        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          No products match your filters.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-md border bg-card">
              <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-[4/3] bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-200 hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
              </Link>

              <div className="space-y-4 p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {product.category.name}
                  </p>
                  <h2 className="mt-1 line-clamp-1 text-base font-semibold">{product.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{currencyFormatter.format(product.price)}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </p>
                  </div>
                  <Link href={`/products/${product.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    View Details
                  </Link>
                </div>

                <AddToCartButton
                  className="w-full"
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    stock: product.stock,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
