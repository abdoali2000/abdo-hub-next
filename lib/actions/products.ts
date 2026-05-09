"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

type CreateProductInput = {
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  categoryId: string
  sellerId?: string
}

type ActionResult =
  | { success: true; message: string; productId: string }
  | { success: false; message: string }

type UpdateProductInput = {
  name: string
  description: string
  price: number
  stock: number
  categoryId: string
}

export type ProductFormState = {
  message: string
  errors?: {
    name?: string[]
    description?: string[]
    price?: string[]
    stock?: string[]
    categoryId?: string[]
    image?: string[]
  }
}

const imageSchema = z
  .custom<File>((value) => value instanceof File && value.size > 0, "Product image is required.")
  .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be 5MB or smaller.")
  .refine((file) => file.type.startsWith("image/"), "Image must be a valid image file.")

const createProductFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  description: z.string().trim().min(1, "Description is required."),
  price: z.coerce.number().positive("Price must be greater than 0."),
  stock: z.coerce
    .number()
    .int("Stock must be a whole number.")
    .min(0, "Stock must be greater than or equal to 0."),
  categoryId: z.string().trim().min(1, "Category is required."),
  image: imageSchema,
})

function getProductImagePath(file: File, userId: string) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg"

  return `${userId}/${crypto.randomUUID()}.${safeExtension}`
}

async function uploadProductImage(file: File, userId: string) {
  const supabase = getSupabaseServerClient()
  const path = getProductImagePath(file, userId)

  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(path)

  return data.publicUrl
}

export async function createProductFromForm(
  _previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await auth()

  if (!session?.user?.id || !session.user.role) {
    return { message: "Unauthorized." }
  }

  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    return { message: "You do not have permission to create products." }
  }

  const parsed = createProductFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    image: formData.get("image"),
  })

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  let imageUrl: string

  try {
    imageUrl = await uploadProductImage(parsed.data.image, session.user.id)
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Image upload failed.",
      errors: {
        image: ["Image upload failed. Please try again."],
      },
    }
  }

  const result = await createProduct({
    name: parsed.data.name,
    description: parsed.data.description,
    price: parsed.data.price,
    stock: parsed.data.stock,
    categoryId: parsed.data.categoryId,
    images: [imageUrl],
  })

  if (!result.success) {
    return { message: result.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/products")
  redirect(`/dashboard/products?success=${encodeURIComponent(result.message)}`)
}

export async function createProduct(input: CreateProductInput): Promise<ActionResult> {
  const session = await auth()

  if (!session?.user?.id || !session.user.role) {
    return { success: false, message: "Unauthorized." }
  }

  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    return { success: false, message: "You do not have permission to create products." }
  }

  const name = input.name?.trim()
  const description = input.description?.trim()
  const categoryId = input.categoryId?.trim()
  const price = Number(input.price)
  const stock = Number(input.stock)
  const images = Array.isArray(input.images)
    ? input.images.map((image) => image.trim()).filter(Boolean)
    : []

  if (!name || !description || !categoryId) {
    return { success: false, message: "Name, description, and category are required." }
  }

  if (Number.isNaN(price) || price <= 0) {
    return { success: false, message: "Price must be greater than 0." }
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return { success: false, message: "Stock must be an integer greater than or equal to 0." }
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  })

  if (!category) {
    return { success: false, message: "Category not found." }
  }

  let sellerId = session.user.id

  if (session.user.role === "ADMIN" && input.sellerId?.trim()) {
    const seller = await prisma.user.findUnique({
      where: { id: input.sellerId.trim() },
      select: { id: true, role: true },
    })

    if (!seller || (seller.role !== "SELLER" && seller.role !== "ADMIN")) {
      return { success: false, message: "Invalid seller." }
    }

    sellerId = seller.id
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      images,
      categoryId,
      sellerId,
    },
    select: { id: true },
  })

  return {
    success: true,
    message: "Product created successfully.",
    productId: product.id,
  }
}

export async function getProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const session = await auth()

  if (!session?.user?.id || !session.user.role) {
    return { success: false, message: "Unauthorized." }
  }

  const id = productId?.trim()

  if (!id) {
    return { success: false, message: "Invalid product." }
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, sellerId: true },
  })

  if (!product) {
    return { success: false, message: "Product not found." }
  }

  if (session.user.role !== "ADMIN" && product.sellerId !== session.user.id) {
    return { success: false, message: "You do not have permission to delete this product." }
  }

  await prisma.product.delete({
    where: { id: product.id },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/products")

  return {
    success: true,
    message: "Product deleted successfully.",
    productId: product.id,
  }
}

export async function updateProduct(
  productId: string,
  input: UpdateProductInput
): Promise<ActionResult> {
  const session = await auth()

  if (!session?.user?.id || !session.user.role) {
    return { success: false, message: "Unauthorized." }
  }

  const id = productId?.trim()
  const name = input.name?.trim()
  const description = input.description?.trim()
  const categoryId = input.categoryId?.trim()
  const price = Number(input.price)
  const stock = Number(input.stock)

  if (!id) {
    return { success: false, message: "Invalid product." }
  }

  if (!name || !description || !categoryId) {
    return { success: false, message: "Name, description, and category are required." }
  }

  if (Number.isNaN(price) || price <= 0) {
    return { success: false, message: "Price must be greater than 0." }
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return { success: false, message: "Stock must be an integer greater than or equal to 0." }
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, sellerId: true },
  })

  if (!product) {
    return { success: false, message: "Product not found." }
  }

  if (session.user.role !== "ADMIN" && product.sellerId !== session.user.id) {
    return { success: false, message: "You do not have permission to update this product." }
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  })

  if (!category) {
    return { success: false, message: "Category not found." }
  }

  await prisma.product.update({
    where: { id: product.id },
    data: {
      name,
      description,
      price,
      stock,
      categoryId,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/products")

  return {
    success: true,
    message: "Product updated successfully.",
    productId: product.id,
  }
}
