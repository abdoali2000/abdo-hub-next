import { ProductForm } from "@/components/product-form"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

type NewProductPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const params = await searchParams
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })

  async function handleAddCategory() {
    "use server"

    const baseName = "General"
    const existing = await prisma.category.findUnique({
      where: { slug: "general" },
      select: { id: true },
    })
    const slug = existing ? `general-${Date.now()}` : "general"

    await prisma.category.create({
      data: {
        name: baseName,
        slug,
        description: "Temporary default category",
      },
    })

    redirect("/dashboard/products/new")
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Product</CardTitle>
          <CardDescription>Add a new product to your catalog.</CardDescription>
        </CardHeader>
        <CardContent>
          {params.error ? (
            <p className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {params.error}
            </p>
          ) : null}

          {categories.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No categories found. Add one category first, then create your product.
              </p>
              <form action={handleAddCategory}>
                <Button type="submit">Add Category</Button>
              </form>
            </div>
          ) : (
            <ProductForm categories={categories} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
