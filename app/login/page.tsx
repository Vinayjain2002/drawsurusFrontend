"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ApiResponse } from "@/lib/api"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    try {
      if (!email || !password) {
        toast({
          title: "Missing Information",
          description: "Please enter both email and password.",
          variant: "destructive",
        })
        return;
      }
      // const loginResponse= await login({ email: email,password:password })
      const loginResponse= await login({email: email, password: password});
      if(loginResponse == true){
        toast({
          title: "Login Successful!",
          description: "Welcome back to Drawsurus!",
        })
        router.push("/");
      }
      
 

    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="text-4xl">🦕</div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>
            Sign in to your Drawsurus account to start drawing and guessing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              className="w-full bg-green-600 hover:bg-green-700 text-white border-green-600" 
              onClick={() => {
                localStorage.setItem("guestMode", "true");
                router.push("/");
              }}
            >
              Continue as Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}