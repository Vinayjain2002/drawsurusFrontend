"use client"

import { AuthResponse, LoginRequest , SignUpRequest} from "@/lib/api"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import ApiService from "@/lib/api"


export interface User{
  id: string,
  userName: string,
  email: string,
  avatar?: string,
  createdAt: string,
  isAdmin: boolean,
  lastOnline?: Date,
  isOnline?: boolean,
  enterpriseTag?: string,
  totalGamePlayed?: number,
  totalWins?: number
}



interface AuthContextType {
  user: User | null;
  login: (userData: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  signup: (user: {userName: string,email: string, password: string}) => Promise<void>;
  isLoading: boolean;
}


const AuthContext= createContext<AuthContextType | undefined>(undefined);
const apiService = new ApiService("http://localhost:5000");

// custom hook for handling user Authentication
export function AuthProvider({children}: {children: ReactNode}){
  const { toast } = useToast()
  const [user, setUser]= useState<User | null>(null);
  const [isLoading, setIsLoading]= useState(true);
  
  // trying to get the user details from the token on the pageLoad
  useEffect(()=>{
    const fetchUserFromToken = async () => {
      const token = localStorage.getItem("auth_token");
      if(token){
        try{
          // Get fresh user data from the server using the token
          const userData = await apiService.getCurrentUser();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
        catch(err){
          console.log("Error fetching user details from token:", err);
          // Clear invalid token and user data
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    fetchUserFromToken();
  }, []); 

  const login= async(userData: {email: string, password: string})=>{
    const loginRequest: LoginRequest = {
          email: userData.email,
          password: userData.password
        };
        const authData: AuthResponse = await apiService.login(loginRequest);
        setUser(authData.user);
        localStorage.setItem("user", JSON.stringify(authData.user));
        // alert(authData.status);
        // if(authData.status== 200 && authData.refreshToken){
          
        // }
        // else if(authData.status== 401){
        //     toast({title: "username or password is incorrect", "description": "Combination does not match any entry"});
        // }  
        // else if(authData.status== 500){
        //   toast({title: "Internal Server Error", description: "Some Error at our end"});
        // }
      }


      const signup= async(userData: {userName: string, email: string, password: string})=>{
          const signUpRequest: SignUpRequest={
              userName: userData.userName,
              email: userData.email,
              password: userData.password,
              enterpriseTag: "sparsh"
          };
          const authData: AuthResponse= await apiService.signup(signUpRequest);116/8
         
          if(authData.token){
            setUser(authData.user);
            localStorage.setItem("user", JSON.stringify(authData.user));
          }
        //   else if(authData.status== 400){
        //     toast({
        //       title: "Wrong Input Credentials!",
        //       description: "Some of the input fields failed Validations",
        //     })
        //   }
        //   else if(authData.status== 409){
        //     toast({
        //       title: "Username or email already exists!",
        //       description: "Username or email is associated with some account"
        //     })
        // }
        //   else{
        //     toast({
        //       title: "Internal Server Error",
        //       description: "There is some Problem at our end"
        //     })
        //   }
      }

      const logout= async()=>{
        const authData: boolean= await apiService.logout();
        setUser(null);
        localStorage.removeItem("user");
      }

      return (
        <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
          {children}
        </AuthContext.Provider>
      )
      
  }


export function useAuth(){
  const context= useContext(AuthContext);
  if(context== undefined)
{
  throw new Error("useAuth must be used with an AuthProvider");
}
  return context;
}
