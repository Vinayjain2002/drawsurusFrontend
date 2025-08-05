"use client"

import { useState, useCallback } from "react"
import { Toaster } from "@/components/ui/toaster"
import LobbyScreen from "@/components/lobby-screen"
import GameScreen from "@/components/game-screen"
import GameOverScreen from "@/components/game-over-screen"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export type GameState = "lobby" | "game" | "gameOver"

export interface Player {
  id: string
  name: string
  score: number
  isReady: boolean
  isHost: boolean
  isDrawing?: boolean
  avatar: string
  correctGuesses: number
}

export interface GameSettings {
  rounds: number
  timePerRound: number
  isPrivate: boolean
  maxPlayers: number
  difficulty: "easy" | "medium" | "hard"
  category: "all" | "animals" | "objects" | "actions" | "food"
}

export interface GameData {
  currentRound: number
  currentDrawer: string
  currentWord: string
  wordHint: string
  timeLeft: number
  players: Player[]
  settings: GameSettings
  winner?: Player
  gameId: string
  roundStartTime: number
}

const AVATARS = ["🦕", "🎨", "🌟", "🎯", "🚀", "🎪", "🎭", "🎨", "🦄", "🌈", "⭐", "🎊"]

const WORD_CATEGORIES = {
  animals: ["ELEPHANT", "BUTTERFLY", "DOLPHIN", "PENGUIN", "GIRAFFE", "OCTOPUS", "KANGAROO", "FLAMINGO"],
  objects: ["GUITAR", "UMBRELLA", "TELESCOPE", "BICYCLE", "CAMERA", "LIGHTHOUSE", "WINDMILL", "CASTLE"],
  actions: ["DANCING", "SWIMMING", "FLYING", "COOKING", "READING", "SINGING", "JUMPING", "PAINTING"],
  food: ["PIZZA", "HAMBURGER", "SPAGHETTI", "SUSHI", "DONUT", "TACO", "SANDWICH", "PANCAKE"],
  all: [
    "ELEPHANT", "BUTTERFLY", "DOLPHIN", "PENGUIN", "GIRAFFE", "OCTOPUS", "KANGAROO", "FLAMINGO",
    "GUITAR", "UMBRELLA", "TELESCOPE", "BICYCLE", "CAMERA", "LIGHTHOUSE", "WINDMILL", "CASTLE",
    "DANCING", "SWIMMING", "FLYING", "COOKING", "READING", "SINGING", "JUMPING", "PAINTING",
    "PIZZA", "HAMBURGER", "SPAGHETTI", "SUSHI", "DONUT", "TACO", "SANDWICH", "PANCAKE"
  ],
}

export default function DrawsurusGame() {
  const [gameState, setGameState] = useState<GameState>("lobby")
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const { toast } = useToast()
  const { user, isLoading } = useAuth()

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // If no user is authenticated, redirect to landing page
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🦕</div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Drawsurus!</h1>
          <p className="text-white/80 mb-8">Please sign in or continue as guest to start playing</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/signup'}>
              Sign Up
            </Button>
            <Button variant="ghost" onClick={() => window.location.href = '/landing'}>
              Learn More
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const [gameData, setGameData] = useState<GameData>({
    currentRound: 1,
    currentDrawer: "",
    currentWord: "",
    wordHint: "",
    timeLeft: 60,
    players: [],
    settings: {
      rounds: 3,
      timePerRound: 60,
      isPrivate: false,
      maxPlayers: 8,
      difficulty: "medium",
      category: "all",
    },
    winner: undefined,
    gameId: Math.random().toString(36).substr(2, 9),
    roundStartTime: Date.now(),
  })

  const [customWords, setCustomWords] = useState<string[]>([])

  const generateWordHint = useCallback((word: string, difficulty: GameData["settings"]["difficulty"]) => {
    const hintLevels = {
      easy: 0.7, // Show 70% of letters
      medium: 0.5, // Show 50% of letters
      hard: 0.3, // Show 30% of letters
    }

    const showRatio = hintLevels[difficulty]
    const lettersToShow = Math.ceil(word.length * showRatio)
    const positions = new Set<number>()

    // Always show first and last letter
    positions.add(0)
    if (word.length > 1) positions.add(word.length - 1)

    // Add random positions
    while (positions.size < lettersToShow && positions.size < word.length) {
      positions.add(Math.floor(Math.random() * word.length))
    }

    return word
      .split("")
      .map((letter, index) => (positions.has(index) ? letter : "_"))
      .join(" ")
  }, [])

  const getRandomWord = useCallback(
    (category: GameData["settings"]["category"]) => {
      // Use custom words if available, otherwise use default categories
      const words = customWords.length > 0 ? customWords : WORD_CATEGORIES[category]
      return words[Math.floor(Math.random() * words.length)]
    },
    [customWords],
  )

  const handleJoinGame = useCallback(
    (playerName: string, isHost = false) => {
      const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]
      const newPlayer: Player = {
        id: Math.random().toString(36).substr(2, 9),
        name: playerName,
        score: 0,
        isReady: isHost, // Host is automatically ready
        isHost,
        avatar: randomAvatar,
        correctGuesses: 0,
      }

      setCurrentPlayer(newPlayer)
      setGameData((prev) => ({
        ...prev,
        players: [...prev.players, newPlayer],
      }))

      toast({
        title: isHost ? "Game Created!" : "Joined Game!",
        description: `Welcome ${playerName}! ${isHost ? "You're the host." : ""}`,
      })
    },
    [toast],
  )

  const handleStartGame = useCallback(() => {
    const readyPlayers = gameData.players.filter((p) => p.isReady || p.isHost)

    if (readyPlayers.length === 0) {
      toast({
        title: "Cannot Start Game",
        description: "At least one player must be ready!",
        variant: "destructive",
      })
      return
    }

    const firstDrawer = readyPlayers[0]
    const newWord = getRandomWord(gameData.settings.category)
    const wordHint = generateWordHint(newWord, gameData.settings.difficulty)

    setGameData((prev) => ({
      ...prev,
      currentDrawer: firstDrawer.id,
      currentWord: newWord,
      wordHint,
      timeLeft: prev.settings.timePerRound,
      roundStartTime: Date.now(),
      players: prev.players.map((p) => ({
        ...p,
        isDrawing: p.id === firstDrawer.id,
      })),
    }))

    setGameState("game")
    toast({
      title: "Game Started!",
      description: `${firstDrawer.name} is drawing first!`,
    })
  }, [gameData.players, gameData.settings, getRandomWord, generateWordHint, toast])

  const handleGameEnd = useCallback(
    (winner: Player) => {
      setGameData((prev) => ({
        ...prev,
        winner,
      }))
      setGameState("gameOver")

      toast({
        title: "🎉 Game Over!",
        description: `${winner.name} wins with ${winner.score} points!`,
      })
    },
    [toast],
  )

  const handlePlayAgain = useCallback(() => {
    setGameData((prev) => ({
      ...prev,
      currentRound: 1,
      currentDrawer: prev.players[0]?.id || "",
      timeLeft: prev.settings.timePerRound,
      winner: undefined,
      gameId: Math.random().toString(36).substr(2, 9),
      roundStartTime: Date.now(),
      players: prev.players.map((p) => ({
        ...p,
        score: 0,
        isReady: p.isHost, // Only host is ready by default
        correctGuesses: 0,
        isDrawing: false,
      })),
    }))
    setGameState("lobby")
  }, [])

  const handleBackToLobby = useCallback(() => {
    setGameState("lobby")
    setCurrentPlayer(null)
    setGameData((prev) => ({
      ...prev,
      players: [],
      currentRound: 1,
      winner: undefined,
      gameId: Math.random().toString(36).substr(2, 9),
    }))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="text-6xl">🦕</div>
            <h1 className="text-4xl md:text-6xl font-bold text-white">Drawsurus</h1>
          </div>
          <p className="text-white/90 text-lg font-medium">The Ultimate Drawing & Guessing Experience</p>
          <div className="flex justify-center gap-4 mt-4 text-white/80 text-sm">
            <span>🎨 Draw</span>
            <span>🤔 Guess</span>
            <span>🏆 Win</span>
            <span>🎉 Have Fun!</span>
          </div>
          {user && (
            <div className="mt-4 text-white/70 text-sm">
              Welcome back, {user.name}! 🎉
            </div>
          )}
        </header>

        {gameState === "lobby" && (
          <LobbyScreen
            gameData={gameData}
            currentPlayer={currentPlayer}
            customWords={customWords}
            onUpdateCustomWords={setCustomWords}
            onJoinGame={handleJoinGame}
            onStartGame={handleStartGame}
            onUpdateSettings={(settings) => setGameData((prev) => ({ ...prev, settings }))}
            onToggleReady={(playerId) => {
              setGameData((prev) => ({
                ...prev,
                players: prev.players.map((p) => (p.id === playerId ? { ...p, isReady: !p.isReady } : p)),
              }))
            }}
            onKickPlayer={(playerId) => {
              setGameData((prev) => ({
                ...prev,
                players: prev.players.filter((p) => p.id !== playerId),
              }))
              if (currentPlayer?.id === playerId) {
                setCurrentPlayer(null)
              }
            }}
          />
        )}

        {gameState === "game" && currentPlayer && (
          <GameScreen
            gameData={gameData}
            currentPlayer={currentPlayer}
            onGameEnd={handleGameEnd}
            onUpdateGameData={setGameData}
            getRandomWord={getRandomWord}
            generateWordHint={generateWordHint}
          />
        )}

        {gameState === "gameOver" && (
          <GameOverScreen gameData={gameData} onPlayAgain={handlePlayAgain} onBackToLobby={handleBackToLobby} />
        )}
      </div>
      <Toaster />
    </div>
  )
}
