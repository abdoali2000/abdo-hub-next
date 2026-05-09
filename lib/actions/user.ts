"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

type UserActionResult = {
  success: boolean
  message: string
}

type UpdateUserProfileInput = {
  name: string
  phoneNumber?: string
  address?: string
}

export async function updateUserProfile(input: UpdateUserProfileInput): Promise<UserActionResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized." }
  }

  const name = input.name?.trim()
  const phoneNumber = input.phoneNumber?.trim() || null
  const address = input.address?.trim() || null

  if (!name) {
    return { success: false, message: "Name is required." }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phoneNumber,
      address,
    },
  })

  return { success: true, message: "Profile updated successfully." }
}

export async function becomeSeller(): Promise<UserActionResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized." }
  }

  if (session.user.role !== "USER") {
    return { success: false, message: "Your account is already a seller or admin." }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "SELLER" },
  })

  return { success: true, message: "Your account is now a seller." }
}
