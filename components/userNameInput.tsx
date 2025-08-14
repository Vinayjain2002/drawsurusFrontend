"use client"

import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "@/components/ui/input"

interface UserNameInputProps{
    setUserName: (playerName: string)=>void
}
export default function UserNameInput({
    setUserName
}: UserNameInputProps){
    alert("Username for Lobby Screen is called");   
    const [playerName, setPlayerName]= useState("");
    return (
         <div className="max-w-lg mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Join the Adventure!
                </CardTitle>
                <p className="text-gray-600">Enter your name to start playing</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Input
                    placeholder="Your awesome name..."
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter"}
                    className="text-center text-lg py-3 border-2 focus:border-purple-400"
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 text-center">{playerName.length}/20 characters</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={handleCreateGame}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 text-lg font-semibold shadow-lg"
                    disabled={!playerName.trim()}
                  >
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Create New Game
                  </Button>
                  <Button
                    onClick={handleJoin}
                    variant="outline"
                    className="py-3 text-lg font-semibold border-2 hover:bg-purple-50 bg-transparent"
                    disabled={!playerName.trim()}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Join Existing Game
                  </Button>
                </div>

                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Game Features</p>
                  <div className="flex justify-center gap-4 text-xs text-gray-600">
                    <span>🎨 Real-time Drawing</span>
                    <span>💬 Live Chat</span>
                    <span>🏆 Scoring System</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
    )
}