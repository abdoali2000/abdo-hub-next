import { auth } from "@/auth"
import { deleteProduct, getProducts } from "@/lib/actions/products"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

type ProductsPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const session = await auth()
  const params = await searchParams

  if (!session) {
    redirect("/login")
  }

  const products = await getProducts()

  async function handleDeleteProduct(formData: FormData) {
    "use server"

    const productId = String(formData.get("productId") ?? "")
    const result = await deleteProduct(productId)

    if (!result.success) {
      redirect(`/dashboard/products?error=${encodeURIComponent(result.message)}`)
    }

    redirect(`/dashboard/products?success=${encodeURIComponent(result.message)}`)
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      {params.success ? (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-md">
          {params.success}
        </div>
      ) : null}

      {params.error ? (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-md">
          {params.error}
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage the products stored in your catalog.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link
            href="/dashboard/products/new"
            className="inline-flex h-9 items-center rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Product
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          No products found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b px-4 py-2 text-left font-medium">Image</th>
                <th className="border-b px-4 py-2 text-left font-medium">Name</th>
                <th className="border-b px-4 py-2 text-left font-medium">Price</th>
                <th className="border-b px-4 py-2 text-left font-medium">Stock</th>
                <th className="border-b px-4 py-2 text-left font-medium">Category</th>
                <th className="border-b px-4 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="border-b px-4 py-2">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-md border object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-md border bg-gray-50 text-xs text-gray-500">
                        None
                      </div>
                    )}
                  </td>
                  <td className="border-b px-4 py-2 font-medium">{product.name}</td>
                  <td className="border-b px-4 py-2">${product.price.toFixed(2)}</td>
                  <td className="border-b px-4 py-2">{product.stock}</td>
                  <td className="border-b px-4 py-2">{product.category.name}</td>
                  <td className="border-b px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={handleDeleteProduct}>
                        <input type="hidden" name="productId" value={product.id} />
                        <button type="submit" className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </form>
                    </div>
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
