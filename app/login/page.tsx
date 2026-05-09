import Link from "next/link"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"

import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const errorMessage =
    params.error === "CredentialsSignin"
      ? "Invalid email or password."
      : params.error
        ? "Unable to sign in."
        : ""

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-sm text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-zinc-900 underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

async function loginAction(formData: FormData) {
  "use server"

  try {
    const email = formData.get("email")
    const password = formData.get("password")

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        redirect("/login?error=CredentialsSignin")
      }
      redirect("/login?error=AuthError")
    }
    throw error
  }
}
