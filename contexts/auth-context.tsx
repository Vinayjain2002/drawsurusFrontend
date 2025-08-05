"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User{
  email: string,
  name: string
};

interface AuthContextType{
  user: User | null
  login: (user: User)=> void
  logout: ()=> void
  isLoading: boolean
}

const AuthContext= createContext<AuthContextType | undefined>(undefined);

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

  const login= (userData: User)=>{
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  const logout= ()=>{
    setUser(null);
    localStorage.removeItem("user");
  }
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
