import { auth } from "@/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { becomeSeller, updateUserProfile } from "@/lib/actions/user"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

type ProfilePageProps = {
  searchParams: Promise<{ error?: string; success?: string }>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const params = await searchParams
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      role: true,
      phoneNumber: true,
      address: true,
      email: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  async function handleUpdateProfile(formData: FormData) {
    "use server"

    const result = await updateUserProfile({
      name: String(formData.get("name") ?? ""),
      phoneNumber: String(formData.get("phoneNumber") ?? ""),
      address: String(formData.get("address") ?? ""),
    })

    if (!result.success) {
      redirect(`/dashboard/profile?error=${encodeURIComponent(result.message)}`)
    }

    redirect(`/dashboard/profile?success=${encodeURIComponent(result.message)}`)
  }

  async function handleBecomeSeller() {
    "use server"

    const result = await becomeSeller()

    if (!result.success) {
      redirect(`/dashboard/profile?error=${encodeURIComponent(result.message)}`)
    }

    redirect(`/dashboard/profile?success=${encodeURIComponent(result.message)}`)
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <Card>
        <CardHeader>
          <Badge className="w-fit" variant="secondary">
            role: {user.role}
          </Badge>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.error ? (
            <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {params.error}
            </p>
          ) : null}
          {params.success ? (
            <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
              {params.success}
            </p>
          ) : null}

          <form action={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={user.name ?? ""} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" defaultValue={user.phoneNumber ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={user.address ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" defaultValue={user.email} disabled />
            </div>

            <Button type="submit">Save Profile</Button>
          </form>

          {user.role === "USER" ? (
            <form action={handleBecomeSeller}>
              <Button type="submit" variant="outline">
                Become a Seller
              </Button>
            </form>
          ) : (
            <Card>
              <CardContent className="pt-6 text-sm text-emerald-700">
                You have full access to create and manage products.
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
