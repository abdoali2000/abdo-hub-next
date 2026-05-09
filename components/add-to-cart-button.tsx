"use client"

import { Button } from "@/components/ui/button"
import { type CartProduct, useCart } from "@/components/cart-context"
import { ShoppingCart } from "lucide-react"

type AddToCartButtonProps = {
  product: CartProduct
  className?: string
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const isOutOfStock = product.stock <= 0

  return (
    <Button
      type="button"
      className={className}
      disabled={isOutOfStock}
      onClick={() => addItem(product)}
    >
      <ShoppingCart aria-hidden="true" />
      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
    </Button>
  )
}
