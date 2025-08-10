"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { signup } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return { minLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar }
  }

  const passwordValidation = validatePassword(formData.password)
  const isPasswordValid = Object.values(passwordValidation).every(Boolean)
  const doPasswordsMatch = formData.password === formData.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
     
      if (!formData.username || !formData.email || !formData.password) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      if (!isPasswordValid) {
        toast({
          title: "Weak Password",
          description: "Please ensure your password meets all requirements.",
          variant: "destructive",
        })
        return
      }

      if (!doPasswordsMatch) {
        toast({
          title: "Passwords Don't Match",
          description: "Please ensure both passwords are identical.",
          variant: "destructive",
        })
        return
      }

      const response= await signup({
        userName: formData.username,
        email: formData.email,
        password: formData.password
      });
      if(response== true){
        toast({
          title: "Account Created!",
          description: "Welcome to Drawsurus! Your account has been created successfully.",
        })
        
        router.push("/")
      }
      else{
        toast({
          title: "Account Created Failed"
        });
      }
   
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="text-4xl">🦕</div>
          </div>
          <CardTitle className="text-2xl font-bold">Join Drawsurus!</CardTitle>
          <CardDescription>
            Create your account to start drawing and guessing with friends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">UserName</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
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
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
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
              
              {/* Password requirements */}
              {formData.password && (
                <div className="text-xs space-y-1 mt-2">
                  <div className="flex items-center gap-1">
                    <CheckCircle className={`h-3 w-3 ${passwordValidation.minLength ? "text-green-500" : "text-gray-400"}`} />
                    <span className={passwordValidation.minLength ? "text-green-600" : "text-gray-500"}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className={`h-3 w-3 ${passwordValidation.hasUpperCase ? "text-green-500" : "text-gray-400"}`} />
                    <span className={passwordValidation.hasUpperCase ? "text-green-600" : "text-gray-500"}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className={`h-3 w-3 ${passwordValidation.hasLowerCase ? "text-green-500" : "text-gray-400"}`} />
                    <span className={passwordValidation.hasLowerCase ? "text-green-600" : "text-gray-500"}>
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className={`h-3 w-3 ${passwordValidation.hasNumber ? "text-green-500" : "text-gray-400"}`} />
                    <span className={passwordValidation.hasNumber ? "text-green-600" : "text-gray-500"}>
                      One number
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className={`h-3 w-3 ${passwordValidation.hasSpecialChar ? "text-green-500" : "text-gray-400"}`} />
                    <span className={passwordValidation.hasSpecialChar ? "text-green-600" : "text-gray-500"}>
                      One special character
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {formData.confirmPassword && (
                <div className="text-xs">
                  {doPasswordsMatch ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Passwords match
                    </div>
                  ) : (
                    <div className="text-red-500">Passwords don't match</div>
                  )}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
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
