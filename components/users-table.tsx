"use client"

import { toggleUserRole } from "@/lib/actions/user"
import { useTransition, useState } from "react" 

type User = {
  id: string
  name: string | null
  email: string
  role: "USER" | "SELLER" | "ADMIN"
  createdAt: Date
}

type UsersTableProps = {
  users: User[]
  currentUserEmail: string | null | undefined
}

export function UsersTable({ users, currentUserEmail }: UsersTableProps) {
  const [isPending, startTransition] = useTransition()
const [successMessage, setSuccessMessage] = useState<string>("")
const [errorMessage, setErrorMessage] = useState<string>("")

  const handleToggleRole = (userId: string) => {
    startTransition(async () => {
      const result = await toggleUserRole(userId)
      if (result.success) {
        setSuccessMessage(result.message)
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        setErrorMessage(result.message)
        // Clear error message after 3 seconds
        setTimeout(() => setErrorMessage(""), 3000)
      }
      // Refresh the page to see updated roles
      window.location.reload()
    })
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b px-4 py-2 text-left font-medium">Name</th>
              <th className="border-b px-4 py-2 text-left font-medium">Email</th>
              <th className="border-b px-4 py-2 text-left font-medium">Role</th>
              <th className="border-b px-4 py-2 text-left font-medium">Joined</th>
              <th className="border-b px-4 py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="border-b px-4 py-2 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border-b px-4 py-2 font-medium">{user.name || "—"}</td>
                  <td className="border-b px-4 py-2">{user.email}</td>
                  <td className="border-b px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "SELLER"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="border-b px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="border-b px-4 py-2">
                    <button
                      onClick={() => handleToggleRole(user.id)}
                      disabled={
                        isPending || user.email === currentUserEmail || user.role === "ADMIN"
                      }
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? "Updating..." : "Toggle Role"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
