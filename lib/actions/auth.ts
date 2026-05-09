"use server"

import { hash } from "bcryptjs"

import { prisma } from "@/lib/prisma"

type RegisterResult = {
  success: boolean
  message: string
}

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const nameValue = formData.get("name")
  const emailValue = formData.get("email")
  const passwordValue = formData.get("password")

  if (
    typeof nameValue !== "string" ||
    typeof emailValue !== "string" ||
    typeof passwordValue !== "string"
  ) {
    return { success: false, message: "Invalid input." }
  }

  const name = nameValue.trim()
  const email = emailValue.trim().toLowerCase()
  const password = passwordValue.trim()

  if (!name || !email || !password) {
    return { success: false, message: "All fields are required." }
  }

  if (!email.includes("@")) {
    return { success: false, message: "Invalid email address." }
  }

  if (password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters." }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    return { success: false, message: "Email is already registered." }
  }

  const hashedPassword = await hash(password, 12)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  return { success: true, message: "Account created successfully." }
}
