"use client"

import { AuthResponse , LoginResponse, SignUpRequest} from "@/lib/api"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import ApiService from "@/lib/api"
import { User } from "@/utils/types/game"

export interface LoginRequest{
  email: string,
  password: string
}



interface AuthContextType {
  user: User | null;
  login: (userData: { email: string; password: string }) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  signup: (user: {userName: string,email: string, password: string}) => Promise<AuthResponse>;
  isLoading: boolean;
}


const AuthContext= createContext<AuthContextType | undefined>(undefined);
const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL?? "http://localhost:5000");

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
          if(userData.success && userData.data){
            setUser(userData.data);
          }
          else if(userData.status == 500){
            toast({title: "Unable to fetch Details"});
          }
          localStorage.setItem("user", JSON.stringify(userData));
        }
        catch(err){
          console.log("Error fetching user details from token:", err);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    fetchUserFromToken();
  }, []); 


  const login= async(userData: {email: string, password: string}):Promise<LoginResponse>=>{
    const loginRequest: LoginRequest = {
          email: userData.email,
          password: userData.password
        };
        const authData: LoginResponse = await apiService.login(loginRequest);
        if(authData.data?.user){
          setUser(authData.data.user);
        }
        return authData ?? null;
      }


      const signup= async({userName, email,password}: {userName: string, email: string, password: string}): Promise<AuthResponse>=>{
          const signUpRequest: SignUpRequest={
              userName: userName,
              email: email,
              password: password,
              enterpriseTag: "sparsh"
          };
          const authData: AuthResponse= await apiService.signup(signUpRequest);
          if(authData.data?.user){
            setUser(authData.data.user);
          }
          return authData;
      }

      const logout= async()=>{
        const authData: boolean= await apiService.logout();
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("guestMode");
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
