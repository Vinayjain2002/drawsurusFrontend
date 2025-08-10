"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import DrawingCanvas from "@/components/drawing-canvas"
import ChatBox from "@/components/chat-box"
import Scoreboard from "@/components/scoreboard"
import { Timer, Palette, Crown, Lightbulb, SkipForward, Pause, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Player, GameSettings } from "@/utils/types/game"
import VideoMeeting from "@/components/video-meeting"
import WordGuessing from "@/components/word-guessing"
import ScorecardPopup from "@/components/scorecard-popup"

interface LobbyData {
  players: Player[]
  settings: GameSettings
  gameId: string
  roomCode?: string
  status?: "waiting" | "playing" | "completed"
}

interface GamePlayData {
  currentRound: number
  currentDrawer: string
  currentWord: string
  wordHint: string
  timeLeft: number
  roundStartTime: number
  isPaused?: boolean
  showHint?: boolean
}

interface GameData extends LobbyData, GamePlayData {
  winner?: Player
}

interface GameScreenProps {
  gameData: GameData
  currentPlayer: Player
  onGameEnd: (winner: Player) => void
  onUpdateGameData: (updater: (prev: GameData) => GameData) => void
  getRandomWord: (category: GameData["settings"]["category"]) => string
  generateWordHint: (word: string, difficulty: GameData["settings"]["wordDifficulty"]) => string
}

interface ChatMessage {
  id: string
  player: string
  message: string
  type: "guess" | "correct" | "system" | "hint"
  timestamp: number
  avatar?: string
}

// interface ChatMessage {
//   chatId: string
//   roomId: string
//   userId?: string
//   username?: string
//   message?: string
//   type?: "guess" | "chat" | "system"
//   gameId?: string
//   roundNumber?: number
//   timestamp: Date
//   isCorrectGuess?: boolean
//   points: number
//   timeTaken?: number
//   avatar?: string
// }

export default function GameScreen({
  gameData,
  currentPlayer,
  onGameEnd,
  onUpdateGameData,
  getRandomWord,
  generateWordHint,
}: GameScreenProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [canvasData, setCanvasData] = useState<string>("")
  const { toast } = useToast()
  const [isVideoExpanded, setIsVideoExpanded] = useState(false)
  const [showScorecardPopup, setShowScorecardPopup] = useState(false)

  const isCurrentPlayerDrawing = currentPlayer.userId === gameData.currentDrawer
  const currentDrawer = gameData.players.find((p) => p.userId === gameData.currentDrawer)
  const currentDrawerName = currentDrawer?.username || "Unknown"

  // Enhanced timer with pause functionality
  useEffect(() => {
    if (gameData.timeLeft > 0 && !isPaused) {
      const timer = setTimeout(() => {
        onUpdateGameData((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }))
      }, 1000)
      return () => clearTimeout(timer)
    } else if (gameData.timeLeft === 0) {
      handleRoundEnd(false)
    }
  }, [gameData.timeLeft, isPaused])

  // Add system message when round starts
  useEffect(() => {
    if (gameData.currentRound === 1 && chatMessages.length === 0) {
      setChatMessages([
        {
          id: Date.now().toString(),
          player: "System",
          message: `🎮 Game started! ${currentDrawerName} is drawing "${gameData.wordHint}"`,
          type: "system",
          timestamp: Date.now(),
        },
      ])
    }
  }, [gameData.currentRound, currentDrawerName, gameData.wordHint, chatMessages.length])

  const handleRoundEnd = useCallback(
    (wasCorrectGuess = false) => {
      if (!wasCorrectGuess) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            player: "System",
            message: `⏰ Time's up! The word was "${gameData.currentWord}"`,
            type: "system",
            timestamp: Date.now(),
          },
        ])
      }

      // Check if game should end
      if (gameData.currentRound >= gameData.settings.rounds) {
        const winner = gameData.players.reduce((prev, current) => (prev.score > current.score ? prev : current))
        setTimeout(() => {
          setShowScorecardPopup(true) // Show popup instead of going directly to game end
        }, 2000)
        return
      }

      // Move to next round
      setTimeout(() => {
        const currentDrawerIndex = gameData.players.findIndex((p) => p.id === gameData.currentDrawer)
        const nextDrawerIndex = (currentDrawerIndex + 1) % gameData.players.length
        const nextDrawer = gameData.players[nextDrawerIndex]
        const isNewRound = nextDrawerIndex === 0

        const newWord = getRandomWord(gameData.settings.category)
        const wordHint = generateWordHint(newWord, gameData.settings.difficulty)

        onUpdateGameData((prev) => ({
          ...prev,
          currentRound: isNewRound ? prev.currentRound + 1 : prev.currentRound,
          currentDrawer: nextDrawer.id,
          currentWord: newWord,
          wordHint,
          timeLeft: prev.settings.timePerRound,
          roundStartTime: Date.now(),
          players: prev.players.map((p) => ({
            ...p,
            isDrawing: p.id === nextDrawer.id,
          })),
        }))

        setChatMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            player: "System",
            message: `🎨 ${nextDrawer.name} is now drawing! ${isNewRound ? `Round ${gameData.currentRound + 1}!` : ""}`,
            type: "system",
            timestamp: Date.now(),
            avatar: nextDrawer.avatar,
          },
        ])

        setShowHint(false)
        setCanvasData("")
      }, 2000)
    },
    [gameData, onUpdateGameData, getRandomWord, generateWordHint],
  )

  const handleGuess = useCallback(
    (guess: string) => {
      if (isCurrentPlayerDrawing) return

      const isCorrect = guess.toUpperCase() === gameData.currentWord.toUpperCase()
      const timeBonus = Math.floor(gameData.timeLeft / 10)
      const pointsEarned = isCorrect ? Math.max(10, 20 + timeBonus) : 0

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          player: currentPlayer.name,
          message: guess,
          type: isCorrect ? "correct" : "guess",
          timestamp: Date.now(),
          avatar: currentPlayer.avatar,
        },
      ])

      if (isCorrect) {
        // Award points to guesser and drawer
        onUpdateGameData((prev) => ({
          ...prev,
          players: prev.players.map((p) => {
            if (p.id === currentPlayer.id) {
              return { ...p, score: p.score + pointsEarned, correctGuesses: p.correctGuesses + 1 }
            }
            if (p.id === gameData.currentDrawer) {
              return { ...p, score: p.score + 10 } // Drawer bonus
            }
            return p
          }),
        }))

        setChatMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            player: "System",
            message: `🎉 ${currentPlayer.name} guessed correctly! +${pointsEarned} points!`,
            type: "system",
            timestamp: Date.now(),
          },
        ])

        toast({
          title: "Correct Guess! 🎉",
          description: `You earned ${pointsEarned} points!`,
        })

        handleRoundEnd(true)
      }
    },
    [
      isCurrentPlayerDrawing,
      gameData.currentWord,
      gameData.timeLeft,
      gameData.currentDrawer,
      currentPlayer,
      onUpdateGameData,
      toast,
      handleRoundEnd,
    ],
  )

  const handleSkipRound = () => {
    if (currentPlayer.isHost) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          player: "System",
          message: `⏭️ Round skipped by host. The word was "${gameData.currentWord}"`,
          type: "system",
          timestamp: Date.now(),
        },
      ])
      handleRoundEnd(false)
    }
  }

  const handleShowHint = () => {
    if (!showHint) {
      setShowHint(true)
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          player: "System",
          message: `💡 Hint revealed: ${gameData.wordHint}`,
          type: "hint",
          timestamp: Date.now(),
        },
      ])
    }
  }

  const markDrawingComplete = () => {
    if (isCurrentPlayerDrawing) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          player: "System",
          message: `✅ ${currentPlayer.name} marked the drawing as complete!`,
          type: "system",
          timestamp: Date.now(),
        },
      ])

      // Skip to next round
      handleRoundEnd(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeColor = () => {
    if (gameData.timeLeft <= 10) return "text-red-500"
    if (gameData.timeLeft <= 30) return "text-yellow-500"
    return "text-green-500"
  }

  const timeProgress = (gameData.timeLeft / gameData.settings.timePerRound) * 100

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Enhanced Game Header - same as before */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-4 py-2 bg-purple-100 border-purple-300">
                Round {gameData.currentRound}/{gameData.settings.rounds}
              </Badge>
              <div className="flex items-center gap-2">
                <div className="text-xl">{currentDrawer?.avatar}</div>
                <Palette className="w-5 h-5 text-purple-500" />
                <span className="font-semibold">{currentDrawerName} is drawing</span>
                {currentDrawer?.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer with progress */}
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                <div className="text-right">
                  <div className={`text-xl font-bold ${getTimeColor()}`}>{formatTime(gameData.timeLeft)}</div>
                  <Progress value={timeProgress} className="w-20 h-2" />
                </div>
              </div>

              {/* Game controls */}
              <div className="flex gap-2">
                {currentPlayer.isHost && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setIsPaused(!isPaused)} className="gap-1">
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      {isPaused ? "Resume" : "Pause"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleSkipRound} className="gap-1 bg-transparent">
                      <SkipForward className="w-4 h-4" />
                      Skip
                    </Button>
                  </>
                )}
                {isCurrentPlayerDrawing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={markDrawingComplete}
                    className="gap-1 bg-green-50 hover:bg-green-100 border-green-300"
                  >
                    ✅ Mark Complete
                  </Button>
                )}
                {!isCurrentPlayerDrawing && !showHint && (
                  <Button size="sm" variant="outline" onClick={handleShowHint} className="gap-1 bg-transparent">
                    <Lightbulb className="w-4 h-4" />
                    Hint
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Drawing Canvas - Larger area (3 columns) */}
        <div className="lg:col-span-3">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-center">
                {isCurrentPlayerDrawing ? (
                  <div className="space-y-2">
                    <span className="text-2xl font-bold text-purple-600">Draw: {gameData.currentWord}</span>
                    <p className="text-sm text-gray-600">Make it clear but not too obvious! 🎨</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-xl">Guess what {currentDrawerName} is drawing!</span>
                    {showHint && <div className="text-lg text-blue-600 font-mono">💡 Hint: {gameData.wordHint}</div>}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DrawingCanvas canDraw={isCurrentPlayerDrawing} onDrawingChange={setCanvasData} gameData={gameData} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Smaller (1 column) */}
        <div className="space-y-4">
          {/* Video Meeting */}
          <VideoMeeting
            players={gameData.players}
            currentPlayer={currentPlayer}
            isExpanded={isVideoExpanded}
            onToggleExpand={() => setIsVideoExpanded(!isVideoExpanded)}
          />

          {/* Word Guessing for non-drawing players */}
          {!isCurrentPlayerDrawing && (
            <WordGuessing
              currentWord={gameData.currentWord}
              wordHint={gameData.wordHint}
              onGuess={handleGuess}
              disabled={isPaused}
              showHint={showHint}
              onShowHint={handleShowHint}
            />
          )}

          {/* Scoreboard */}
          <Scoreboard players={gameData.players} currentRound={gameData.currentRound} />

          {/* Chat */}
          <ChatBox
            messages={chatMessages}
            onSendMessage={handleGuess}
            disabled={isCurrentPlayerDrawing}
            placeholder={
              isCurrentPlayerDrawing ? "You're drawing! 🎨" : isPaused ? "Game is paused ⏸️" : "Type your guess..."
            }
            currentPlayer={currentPlayer}
          />
        </div>
      </div>

      {/* Scorecard Popup */}
      <ScorecardPopup
        isOpen={showScorecardPopup}
        onClose={() => setShowScorecardPopup(false)}
        gameData={gameData}
        onPlayAgain={() => {
          setShowScorecardPopup(false)
          onGameEnd(gameData.players.reduce((prev, current) => (prev.score > current.score ? prev : current)))
        }}
        onBackToLobby={() => {
          setShowScorecardPopup(false)
          onGameEnd(gameData.players.reduce((prev, current) => (prev.score > current.score ? prev : current)))
        }}
      />
    </div>
  )
}
