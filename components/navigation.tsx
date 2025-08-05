"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import Link from "next/link"

export default function Navigation() {
  const { user, logout } = useAuth()

  return (
    <nav className="absolute top-4 right-4 z-50">
      <div className="flex items-center gap-2">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-white">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-white text-purple-600 hover:bg-white/90">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
} 