"use client"

import { AuthResponse, LoginRequest , SignUpRequest} from "@/lib/api"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import ApiService from "@/lib/api"
export interface User{
  email: string,
  name?: string,
  userName?: string,
  password: string,
  enterpriseTag?: string
};

interface AuthContextType{
  user: User | null
  login: (user: User)=> void
  logout: ()=> void
  signup: (user: User)=> void
  isLoading: boolean
}

const AuthContext= createContext<AuthContextType | undefined>(undefined);
const apiService = new ApiService("http://localhost:5000");

// custom hook for handling user Authentication
export function AuthProvider({children}: {children: ReactNode}){
  const [user, setUser]= useState<User | null>(null);
  const [isLoading, setIsLoading]= useState(true);
  
  // trying to get the user details from the local storage on the pageLoad
  useEffect(()=>{
    const storedUser= localStorage.getItem("user");
    if(storedUser){
      // the data of the user is get from the local storage
      try{
        const parsedUser= JSON.parse(storedUser);
        setUser(parsedUser);
      }
      catch(err){
        console.log("Error parsing the stored User details");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []); 

  const login= async(userData: User)=>{
    alert("the api is called")
    const loginRequest: LoginRequest = {
      email: userData.email,
      password: userData.password
    };
    const authData: AuthResponse = await apiService.login(loginRequest);
    if(authData.token){
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
    else{
      alert("Login of the user Failed");
    }
  }

  const signup= async(userData: User)=>{
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues); // browser crypto API
  
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }

    const signUpRequest: SignUpRequest={
        username: userData.userName ?? result,
        email: userData.email,
        password: userData.password,
        enterpriseTag: userData.enterpriseTag ?? ""
    };
    const authData: AuthResponse= await apiService.signup(signUpRequest);
    if(authData.token){
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
    else{
      alert("Sign Up of User Failed");
    }
  }

  const logout= async()=>{
    alert("Logout of Device is called");
    const authData: boolean= await apiService.logout();
    if(authData== true){
      alert("User Logout Successfully");
    }
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
