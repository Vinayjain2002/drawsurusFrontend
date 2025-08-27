"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import Link from "next/link"
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { useDispatch } from "react-redux"
import { setUserDetails } from "@/store/slices/userSlice"

export default function Navigation() {

  const user= useSelector((state: RootState)=> state.user);
  const { logout } = useAuth()
  const dispatch= useDispatch();
  const logoutUser= async()=>{
    console.log("logging out the user");
    dispatch(setUserDetails({
            userName: "",
            email: ""
          }));
     await logout();
     console.log("user logged out successfully");
      window.location.href= "/login";
  }

  return (
    <nav className="bg-white/10 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-white font-semibold">Drawsurus</span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-white/80">
                  {user.userName}
                </span>
                <Button 
                  variant="ghost" 
                  onClick={logoutUser}
                  className="text-white/80 hover:text-white"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost"
                  onClick={() => window.location.href = '/login'}
                  className="text-white/80 hover:text-white"
                >
                  Login
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => window.location.href = '/signup'}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
