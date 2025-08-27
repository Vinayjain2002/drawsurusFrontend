"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users, Trophy, Palette, Brain } from "lucide-react"
import { useDispatch } from "react-redux"
import { setGuestMode } from "@/store/slices/GuestModeSlice"

export default function LandingPage() {
  const router = useRouter()
  const dispatch= useDispatch();
  const features = [
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Draw & Create",
      description: "Express your creativity with our intuitive drawing tools"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Guess & Win",
      description: "Test your observation skills and guess what others are drawing"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Play with Friends",
      description: "Create private rooms and invite your friends to join"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Compete & Win",
      description: "Earn points, climb leaderboards, and become the ultimate artist"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="text-8xl">🦕</div>
            <h1 className="text-5xl md:text-7xl font-bold text-white">Drawsurus</h1>
          </div>
          <p className="text-white/90 text-xl md:text-2xl font-medium max-w-3xl mx-auto">
            The Ultimate Drawing & Guessing Experience
          </p>
          <p className="text-white/70 text-lg mt-4 max-w-2xl mx-auto">
            Join millions of players worldwide in this exciting game of creativity, 
            observation, and friendly competition!
          </p>
        </header>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8 py-6"
            onClick={() => router.push("/signup")}
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 text-lg px-8 py-6"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            className="text-white hover:bg-white/10 text-lg px-8 py-6"
            onClick={() =>{
              dispatch(setGuestMode({isGuestMode: true}));     
              localStorage.setItem("guestMode", "true");
              router.push("/");
            }}
          >
            Continue as Guest
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-white/20 rounded-full">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/80 text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How to Play */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl">How to Play</CardTitle>
              <CardDescription className="text-white/80">
                Get started in just a few simple steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Create or Join a Room</h3>
                  <p className="text-white/70 text-sm">
                    Start a new game or join an existing one with a room code
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Draw or Guess</h3>
                  <p className="text-white/70 text-sm">
                    Take turns drawing while others try to guess what you're creating
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Score Points</h3>
                  <p className="text-white/70 text-sm">
                    Earn points for correct guesses and compete for the highest score
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-white/60">
          <p>&copy; 2024 Drawsurus. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
} 