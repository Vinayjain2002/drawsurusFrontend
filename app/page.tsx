"use client"

import { useState, useCallback, useEffect , useRef} from "react"
import { Toaster } from "@/components/ui/toaster"
import LobbyScreen from "@/components/lobby-screen"
import GameScreen from "@/components/game-screen"
import GameOverScreen from "@/components/game-over-screen"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import ApiService from "@/lib/api"

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

export interface LobbyData {
  players: Player[]
  settings: GameSettings
  gameId: string
}

export interface GamePlayData {
  currentRound: number
  currentDrawer: string
  currentWord: string
  wordHint: string
  timeLeft: number
  roundStartTime: number
}

// Combined data for when game is active
export interface GameData extends LobbyData, GamePlayData {
  winner?: Player
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
  
    // Auto-join with authenticated user details if available
    // has JoinedRef for the purpose of the user loading only one time
  const hasJoinedRef = useRef(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  
  useEffect(() => {
    refreshUserDetails();
    
    // Check for guest mode from localStorage
    const guestMode = localStorage.getItem("guestMode");
    if (guestMode === "true" && !currentPlayer && !hasJoinedRef.current) {
      hasJoinedRef.current = true;
      setIsGuestMode(true);
      handleJoinGame("Guest Player", true);
      localStorage.removeItem("guestMode"); // Clear the flag
    } else if (user && !currentPlayer && !hasJoinedRef.current) {
      hasJoinedRef.current = true;
      const playerName = user.userName;
      handleJoinGame(playerName, true); // Auto-create game as host
    }
  }, [user, currentPlayer]);

  // Function to refresh user details from server
  const refreshUserDetails = useCallback(async () => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      try {
        const apiService = new ApiService("http://localhost:5000")
        const userData = await apiService.getCurrentUser()
        console.log("User details refreshed:", userData);
        return userData
      } catch (error) {
        console.error("Failed to refresh user details:", error)
        return null
      }
    }
  }, [])
  
  // Lobby data minimal data needed for lobby)
  const [lobbyData, setLobbyData] = useState<LobbyData>({
    players: [],
    settings: {
      rounds: 3,
      timePerRound: 60,
      isPrivate: false,
      maxPlayers: 8,
      difficulty: "medium",
      category: "all",
    },
    gameId: Math.random().toString(36).substr(2, 9),
  })
  
  // Game data (only created when game starts)
  const [gamePlayData, setGamePlayData] = useState<GamePlayData | null>(null)
  const [winner, setWinner] = useState<Player | undefined>(undefined)

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
      setLobbyData((prev) => ({
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
    const readyPlayers = lobbyData.players.filter((p) => p.isReady || p.isHost)

    if (readyPlayers.length === 0) {
      toast({
        title: "Cannot Start Game",
        description: "At least one player must be ready!",
        variant: "destructive",
      })
      return
    }

    const firstDrawer = readyPlayers[0]
    const newWord = getRandomWord(lobbyData.settings.category)
    const wordHint = generateWordHint(newWord, lobbyData.settings.difficulty)

    // Create game play data
    const newGamePlayData: GamePlayData = {
      currentRound: 1,
      currentDrawer: firstDrawer.id,
      currentWord: newWord,
      wordHint,
      timeLeft: lobbyData.settings.timePerRound,
      roundStartTime: Date.now(),
    }

    setGamePlayData(newGamePlayData)
    setLobbyData((prev) => ({
      ...prev,
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
  }, [lobbyData.players, lobbyData.settings, getRandomWord, generateWordHint, toast])

  const handleGameEnd = useCallback(
    (winner: Player) => {
      setWinner(winner)
      setGameState("gameOver")

      toast({
        title: "🎉 Game Over!",
        description: `${winner.name} wins with ${winner.score} points!`,
      })
    },
    [toast],
  )

  const handlePlayAgain = useCallback(() => {
    setGamePlayData(null)
    setWinner(undefined)
    setLobbyData((prev) => ({
      ...prev,
      gameId: Math.random().toString(36).substr(2, 9),
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
    setGamePlayData(null)
    setWinner(undefined)
    setLobbyData((prev) => ({
      ...prev,
      players: [],
      gameId: Math.random().toString(36).substr(2, 9),
    }))
  }, []);

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // If no user is authenticated and not in guest mode, show welcome screen with guest option
  if (!user && !isGuestMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🦕</div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Drawsurus!</h1>
          <p className="text-white/80 mb-8">Please sign in or continue as guest to start playing</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/signup'}>
              Sign Up
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsGuestMode(true);
                handleJoinGame("Guest Player", true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Continue as Guest
            </Button>
            <Button variant="ghost" onClick={() => window.location.href = '/landing'}>
              Learn More
            </Button>
          </div>
        </div>
      </div>
    )
  }


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
              Welcome back, {user.userName}! 🎉
            </div>
          )}
          {isGuestMode && !user && (
            <div className="mt-4 text-white/70 text-sm">
              Playing as Guest Player 🎮
            </div>
          )}
        </header>

        {gameState === "lobby" && (
          <LobbyScreen
            gameData={lobbyData}
            currentPlayer={currentPlayer}
            customWords={customWords}
            onUpdateCustomWords={setCustomWords}
            onJoinGame={handleJoinGame}
            onStartGame={handleStartGame}
            onUpdateSettings={(settings) => setLobbyData((prev) => ({ ...prev, settings }))}
            onToggleReady={(playerId) => {
              setLobbyData((prev) => ({
                ...prev,
                players: prev.players.map((p) => (p.id === playerId ? { ...p, isReady: !p.isReady } : p)),
              }))
            }}
            onKickPlayer={(playerId) => {
              setLobbyData((prev) => ({
                ...prev,
                players: prev.players.filter((p) => p.id !== playerId),
              }))
              if (currentPlayer?.id === playerId) {
                setCurrentPlayer(null)
              }
            }}
          />
        )}

        {gameState === "game" && currentPlayer && gamePlayData && (
          <GameScreen
            gameData={{ ...lobbyData, ...gamePlayData, winner }}
            currentPlayer={currentPlayer}
            onGameEnd={handleGameEnd}
            onUpdateGameData={(updater) => {
              // Create a combined game data for the updater function
              const combinedGameData: GameData = { ...lobbyData, ...gamePlayData!, winner }
              
              // Apply the update
              const updatedGameData = updater(combinedGameData)
              
              // Extract lobby and game play data
              const { currentRound, currentDrawer, currentWord, wordHint, timeLeft, roundStartTime, ...lobbyDataPart } = updatedGameData
              setLobbyData(lobbyDataPart)
              setGamePlayData({
                currentRound,
                currentDrawer,
                currentWord,
                wordHint,
                timeLeft,
                roundStartTime,
              })
            }}
            getRandomWord={getRandomWord}
            generateWordHint={generateWordHint}
          />
        )}

        {gameState === "gameOver" && (
          <GameOverScreen 
            gameData={{ ...lobbyData, ...gamePlayData!, winner }} 
            onPlayAgain={handlePlayAgain} 
            onBackToLobby={handleBackToLobby} 
          />
        )}
      </div>
      <Toaster />
    </div>
  )
}
