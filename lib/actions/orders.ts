"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export type CreateOrderState =
  | {
      success: false
      message: string
      errors?: {
        fullName?: string[]
        shippingAddress?: string[]
        phoneNumber?: string[]
        cartItems?: string[]
      }
    }
  | {
      success: true
      message: string
      orderId: string
    }

const cartItemSchema = z.object({
  id: z.string().trim().min(1, "Product is required."),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0."),
})

const createOrderSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  shippingAddress: z.string().trim().min(8, "Shipping address is required."),
  phoneNumber: z.string().trim().min(7, "Phone number is required."),
  cartItems: z.array(cartItemSchema).min(1, "Your cart is empty."),
})

function parseCartItems(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return []
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return []
  }
}

export async function createOrder(
  _previousState: CreateOrderState,
  formData: FormData
): Promise<CreateOrderState> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Please sign in before checkout.",
    }
  }

  const parsed = createOrderSchema.safeParse({
    fullName: formData.get("fullName"),
    shippingAddress: formData.get("shippingAddress"),
    phoneNumber: formData.get("phoneNumber"),
    cartItems: parseCartItems(formData.get("cartItems")),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted checkout fields.",
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const mergedCartItems = Array.from(
    parsed.data.cartItems
      .reduce((itemsById, item) => {
        const currentQuantity = itemsById.get(item.id) ?? 0
        itemsById.set(item.id, currentQuantity + item.quantity)
        return itemsById
      }, new Map<string, number>())
      .entries()
  ).map(([id, quantity]) => ({ id, quantity }))

  try {
    const orderId = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: {
            in: mergedCartItems.map((item) => item.id),
          },
        },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
        },
      })

      if (products.length !== mergedCartItems.length) {
        throw new Error("One or more products in your cart are no longer available.")
      }

      const productsById = new Map(products.map((product) => [product.id, product]))

      for (const item of mergedCartItems) {
        const product = productsById.get(item.id)

        if (!product || product.stock < item.quantity) {
          throw new Error(
            product
              ? `${product.name} only has ${product.stock} in stock.`
              : "One or more products in your cart are no longer available."
          )
        }
      }

      const totalAmount = mergedCartItems.reduce((total, item) => {
        const product = productsById.get(item.id)
        return total + (product?.price ?? 0) * item.quantity
      }, 0)

      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          status: "PENDING",
        },
        select: {
          id: true,
        },
      })

      await tx.$executeRaw`
        UPDATE "Order"
        SET "customerName" = ${parsed.data.fullName},
            "shippingAddress" = ${parsed.data.shippingAddress},
            "phoneNumber" = ${parsed.data.phoneNumber},
            "paymentMethod" = ${"COD"}
        WHERE "id" = ${order.id}
      `

      await tx.orderItem.createMany({
        data: mergedCartItems.map((item) => {
          const product = productsById.get(item.id)

          return {
            orderId: order.id,
            productId: item.id,
            quantity: item.quantity,
            price: product?.price ?? 0,
          }
        }),
      })

      for (const item of mergedCartItems) {
        const updatedProduct = await tx.product.updateMany({
          where: {
            id: item.id,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })

        if (updatedProduct.count !== 1) {
          const product = productsById.get(item.id)
          throw new Error(
            product
              ? `${product.name} no longer has enough stock.`
              : "One or more products in your cart are no longer available."
          )
        }
      }

      return order.id
    })

    revalidatePath("/products")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Order created successfully.",
      orderId,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Could not create your order.",
    }
  }
}
