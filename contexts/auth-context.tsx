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
  login: (userData: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (user: {userName: string,email: string, password: string}) => Promise<boolean>;
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


  const login= async(userData: {email: string, password: string}):Promise<boolean>=>{
    const loginRequest: LoginRequest = {
          email: userData.email,
          password: userData.password
        };
        const authData: LoginResponse = await apiService.login(loginRequest);
        if(authData.status== 400){
          toast({title: "Invalid Input Format"});
          return false;
        }
        else if(authData.status== 401){
          toast({title: "Unable to fetch user details"});
          return false;
        }
        else if(authData.status== 200 && authData.data){
          setUser(authData.data.user);
          localStorage.setItem("user", JSON.stringify(authData.data.user));
          toast({title: "User Logged In successfully"});
          return true;
        }
        else if(authData.status== 500){
          toast({"title": "Internal Server Error"});
          return false;
        }
        else{
          toast({"title": "Unknown Error Occured"});
          return false;
        }
      }


      const signup= async({userName, email,password}: {userName: string, email: string, password: string}): Promise<boolean>=>{
          const signUpRequest: SignUpRequest={
              userName: userName,
              email: email,
              password: password,
              enterpriseTag: "sparsh"
          };
          const authData: AuthResponse= await apiService.signup(signUpRequest);
          if(authData.status == 400){
            toast({title: "Invalid Credentials Provided"});
            alert("Invalid Credentials provided");
            return false;
          }
          else if(authData.status == 409){
            toast({title: "Username or Email already Exists"});
            alert("Username or Email already exists");
            return false;
          }
          else if(authData.status== 201 && authData.data){
            toast({"title": "User Registered Successfully"});
            setUser(authData.data?.user);
            localStorage.setItem("auth_token", JSON.stringify(authData.data.token));
            localStorage.setItem("user", JSON.stringify(authData.data.user));
            return true;
          }
          else {
              toast({"title": "Internal Server Error"});
              return false;
          }
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
