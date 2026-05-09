"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProductFromForm, type ProductFormState } from "@/lib/actions/products"
import Image from "next/image"
import { useActionState, useEffect, useState } from "react"

type CategoryOption = {
  id: string
  name: string
}

type ProductFormProps = {
  categories: CategoryOption[]
}

const initialState: ProductFormState = {
  message: "",
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null
  }

  return <p className="text-sm text-red-600">{messages[0]}</p>
}

export function ProductForm({ categories }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(createProductFromForm, initialState)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [dismissedMessage, setDismissedMessage] = useState("")

  const toastMessage = state.message && state.message !== dismissedMessage ? state.message : ""

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <>
      {toastMessage ? (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <p>{toastMessage}</p>
            <button
              type="button"
              className="text-red-700 hover:text-red-900"
              onClick={() => setDismissedMessage(state.message)}
              aria-label="Dismiss"
            >
              x
            </button>
          </div>
        </div>
      ) : null}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required aria-invalid={Boolean(state.errors?.name)} />
          <FieldError messages={state.errors?.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            required
            aria-invalid={Boolean(state.errors?.description)}
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
          />
          <FieldError messages={state.errors?.description} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              required
              aria-invalid={Boolean(state.errors?.price)}
            />
            <FieldError messages={state.errors?.price} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              required
              aria-invalid={Boolean(state.errors?.stock)}
            />
            <FieldError messages={state.errors?.stock} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
            defaultValue=""
            aria-invalid={Boolean(state.errors?.categoryId)}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError messages={state.errors?.categoryId} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            required
            aria-invalid={Boolean(state.errors?.image)}
            onChange={(event) => {
              const file = event.target.files?.[0]

              if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
              }

              setPreviewUrl(file ? URL.createObjectURL(file) : "")
            }}
          />
          <FieldError messages={state.errors?.image} />
          {previewUrl ? (
            <div className="relative h-48 w-full overflow-hidden rounded-md border bg-muted">
              <Image
                src={previewUrl}
                alt="Product preview"
                fill
                unoptimized
                sizes="(min-width: 768px) 640px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating..." : "Create Product"}
        </Button>
      </form>
    </>
  )
}
