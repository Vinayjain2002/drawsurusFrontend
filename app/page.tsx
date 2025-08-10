"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Toaster } from "@/components/ui/toaster"
import LobbyScreen from "@/components/lobby-screen"
import GameScreen from "@/components/game-screen"
import GameOverScreen from "@/components/game-over-screen"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import ApiService from "@/lib/api"
import type {
  Player,
  Room,
  Game,
  GameSettings,
  ChatMessage,
  Drawing,
  Round,
  FinalScore,
  UserStats,
  Word
} from "@/utils/types/game"

export type GameState = "lobby" | "game" | "gameOver"

// Lobby data interface

export interface LobbyData {
  players: Player[]
  settings: GameSettings
  gameId: string
  roomCode?: string
  status?: "waiting" | "playing" | "completed"
}

// Game play data interface
export interface GamePlayData {
  currentRound: number
  currentDrawer: string
  currentWord: string
  wordHint: string
  timeLeft: number
  roundStartTime: number
  isPaused?: boolean
  showHint?: boolean
}

// Combined data for when game is active
export interface GameData extends LobbyData, GamePlayData {
  winner?: Player
}

const AVATARS = ["🦕", "🎨", "🌟", "🎯", "🚀", "🎪", "🎭", "🎨", "🦄", "🌈", "⭐", "🎊"]

export default function DrawsurusGame() {
  const guestUsername = "Guest Player " + Math.random().toString(36).substr(2, 5);
  const [gameState, setGameState] = useState<GameState>("lobby")
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const { toast } = useToast()
  const { user, isLoading } = useAuth()

  // Auto-join with authenticated user details if available
  // has JoinedRef for the purpose of the user loading only one time
  const hasJoinedRef = useRef(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const createGuestPlayer = useCallback(
    async (username: string, isHost: boolean, enterpriseTag?: string) => {
      const apiService = new ApiService("http://localhost:5000");
      
      const guestUserResponse = await apiService.createGuestUser({
        userName: username,
        enterpriseTag: enterpriseTag || "drawsurus"
      });

      if (guestUserResponse.status === 201 && guestUserResponse.data) {
        alert("Guest User Created Successfully");

        const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];

        const guestPlayer: Player = {
          userId: guestUserResponse.data.id,
          username: username || "Guest Player",
          score: 0,
          isReady: true,
          isHost: isHost || false,
          avatar: randomAvatar,
          correctGuesses: 0,
          drawings: 0,
          joinedAt: new Date().toISOString(),
        };

        setCurrentPlayer(guestPlayer);
        setLobbyData((prev) => ({
          ...prev,
          players: [...prev.players, guestPlayer],
        }));
      } else {
        alert("Failed to create guest user. Please try again later.");
      }
    },[]
  );

  // this one is used for the purpose if the user has comes from the Login Or Signup pages
  useEffect(() => {
    refreshUserDetails();

    // Check for guest mode from localStorage
    const guestMode = localStorage.getItem("guestMode");
    if (guestMode === "true" && !currentPlayer && !hasJoinedRef.current) {
      hasJoinedRef.current = true;
      setIsGuestMode(true);
      createGuestPlayer(guestUsername, true, "drawsurus"); // Create guest player
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

  const createNewGame = useCallback(async () => {
    // Fist Creating a new Room then we will create a new Game
    const apiService = new ApiService("http://localhost:5000");
    const roomRequest: Room= {
      hostId: currentPlayer?.userId || "",
      maxPlayers= 8,
      players: currentPlayer ? [currentPlayer] : [],
      status: "waiting",
      createdAt: new Date().toISOString(),
      settings: {
        roundTime: 60,
        roundsPerGame: 3,
        wordDifficulty: "medium",
        allowCustomWords: false,
        maxPlayers: 8,
        category: "all",
      }
    }
    const roomResponse = await apiService.createRoom(roomRequest);
    if(roomResponse.status== 201){
      // so the room is created Successfully
      const newRoom: Room = roomResponse.data;
      console.log("New Room Created:", newRoom);
      alert(newRoom.roomCode);

      // now we can create a new Game
    }
    const newGameId = Math.random().toString(36).substr(2, 9)
    setLobbyData((prev) => ({
      ...prev,
      gameId: newGameId,
      players: [],
      settings: {
        roundTime: 60,
        roundsPerGame: 3,
        wordDifficulty: "medium",
        allowCustomWords: false,
        maxPlayers: 8,
        category: "all",
      },
    }))
    setCurrentPlayer(null)
    setGameState("lobby")
    toast({
      title: "New Game Created!",
      description: `Game ID: ${newGameId}`,
    })
  }, [toast])

  // Lobby data (minimal data needed for lobby)
  const [lobbyData, setLobbyData] = useState<LobbyData>({
    players: currentPlayer ? [currentPlayer] : [],
    settings: {
      roundTime: 60,
      roundsPerGame: 3,
      wordDifficulty: "medium",
      allowCustomWords: false,
      maxPlayers: 8,
      category: "all",
    },
    gameId: Math.random().toString(36).substr(2, 9),
  })

  // Game data (only created when game starts)
  const [gamePlayData, setGamePlayData] = useState<GamePlayData | null>(null)
  const [winner, setWinner] = useState<Player | undefined>(undefined)

  const [customWords, setCustomWords] = useState<string[]>([])

  const generateWordHint = useCallback((word: string, difficulty: GameData["settings"]["wordDifficulty"]) => {
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
    async (category: string | undefined) => {
      if (customWords.length > 0) {
        return customWords[Math.floor(Math.random() * customWords.length)];
      } else {
        const apiService = new ApiService("http://localhost:5000");
        const wordsResponse = await apiService.getWords({
          category: category || "all",
          difficulty: "medium"
        });

        if (wordsResponse.data && wordsResponse.data.length > 0) {
          return wordsResponse.data[Math.floor(Math.random() * wordsResponse.data.length)];
        } else {
          console.error("No words found for the selected category or difficulty");
          return "DRAWING"; // Fallback word
        }
      }
    },
    [customWords]
  );


  const handleJoinGame = useCallback(
    (playerName: string, isHost = false) => {
      if (!playerName || playerName.trim() === "") {
        toast({
          title: "Invalid Player Name",
          description: "Please enter a valid player name.",
          variant: "destructive",
        })
        return
      }

      const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]
      const newPlayer: Player = {
        userId: Math.random().toString(36).substr(2, 9),
        username: playerName,
        score: 0,
        isReady: isHost, // Host is automatically ready
        isHost,
        avatar: randomAvatar,
        correctGuesses: 0,
        drawings: 0,
        joinedAt: new Date().toISOString(),
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

const handleStartGame = useCallback(async () => {
  const readyPlayers = lobbyData.players.filter((p) => p.isReady || p.isHost);

  if (readyPlayers.length === 0) {
    toast({
      title: "Cannot Start Game",
      description: "At least one player must be ready!",
      variant: "destructive",
    });
    return;
  }

  const firstDrawer = readyPlayers[0];
  const newWord = await getRandomWord(lobbyData.settings.category || "all");
  const wordString = typeof newWord === "string" ? newWord : newWord.word;
  const wordHint = generateWordHint(wordString, lobbyData.settings.wordDifficulty);

  // Create game play data
  const newGamePlayData: GamePlayData = {
    currentRound: 1,
    currentDrawer: firstDrawer.userId,
    currentWord: wordString,
    wordHint,
    timeLeft: lobbyData.settings.roundTime,
    roundStartTime: Date.now(),
  };

  setGamePlayData(newGamePlayData);
  setLobbyData((prev) => ({
    ...prev,
    players: prev.players.map((p) => ({
      ...p,
      isDrawing: p.userId === firstDrawer.userId,
    })),
  }));

  setGameState("game");
  toast({
    title: "Game Started!",
    description: `${firstDrawer.username} is drawing first!`,
  });
}, [lobbyData.players, lobbyData.settings, getRandomWord, generateWordHint, toast]);

  const handleGameEnd = useCallback(
    (winner: Player) => {
      setWinner(winner)
      setGameState("gameOver")

      toast({
        title: "🎉 Game Over!",
        description: `${winner.username} wins with ${winner.score} points!`,
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
                localStorage.setItem("guestMode", "true");
                handleJoinGame(guestUsername, true);
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
                players: prev.players.map((p) => (p.userId === playerId ? { ...p, isReady: !p.isReady } : p)),
              }))
            }}
            onKickPlayer={(playerId) => {
              setLobbyData((prev) => ({
                ...prev,
                players: prev.players.filter((p) => p.userId !== playerId),
              }))
              if (currentPlayer?.userId === playerId) {
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
/*
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
