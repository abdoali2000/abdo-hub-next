"use client"

import { createContext, useContext, useMemo, useSyncExternalStore } from "react"

export type CartProduct = {
  id: string
  name: string
  price: number
  image: string | null
  stock: number
}

export type CartItem = CartProduct & {
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  totalPrice: number
  addItem: (product: CartProduct) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const storageKey = "abdo-hub-cart"
const cartChangeEvent = "abdo-hub-cart-change"

function parseCart(value: string | null): CartItem[] {
  if (!value) {
    return []
  }

  try {
    return JSON.parse(value) as CartItem[]
  } catch {
    return []
  }
}

function getCartSnapshot() {
  return window.localStorage.getItem(storageKey) ?? "[]"
}

function getServerCartSnapshot() {
  return "[]"
}

function subscribeToCart(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(cartChangeEvent, onStoreChange)

  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(cartChangeEvent, onStoreChange)
  }
}

function readCart() {
  return parseCart(window.localStorage.getItem(storageKey))
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(items))
  window.dispatchEvent(new Event(cartChangeEvent))
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cartSnapshot = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot
  )
  const items = useMemo(() => parseCart(cartSnapshot), [cartSnapshot])

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0)
    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

    return {
      items,
      itemCount,
      totalPrice,
      addItem(product) {
        const currentItems = readCart()
        const existingItem = currentItems.find((item) => item.id === product.id)

        if (existingItem) {
          writeCart(
            currentItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
                : item
            )
          )
          return
        }

        writeCart([...currentItems, { ...product, quantity: 1 }])
      },
      removeItem(productId) {
        writeCart(readCart().filter((item) => item.id !== productId))
      },
      clearCart() {
        writeCart([])
      },
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.")
  }

  return context
}
