"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trophy, Crown, Star, Share2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { GameData } from "@/app/page"

interface ScorecardPopupProps {
  isOpen: boolean
  onClose: () => void
  gameData: GameData
  onPlayAgain: () => void
  onBackToLobby: () => void
}

export default function ScorecardPopup({ isOpen, onClose, gameData, onPlayAgain, onBackToLobby }: ScorecardPopupProps) {
  const [showDetails, setShowDetails] = useState(false)
  const sortedPlayers = [...gameData.players].sort((a, b) => b.score - a.score)
  const winner = sortedPlayers[0]
  const maxScore = Math.max(...gameData.players.map((p) => p.score), 1)
  const { toast } = useToast()

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 1:
        return <Trophy className="w-5 h-5 text-gray-400" />
      case 2:
        return <Trophy className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-500">#{index + 1}</span>
    }
  }

  const shareResults = () => {
    const results = `🦕 Drawsurus Game Results!\n\n🏆 Winner: ${winner.name} (${winner.score} points)\n\nPlay Drawsurus now! 🎨`

    if (navigator.share) {
      navigator.share({
        title: "Drawsurus Game Results",
        text: results,
      })
    } else {
      navigator.clipboard.writeText(results)
      toast({
        title: "Results Copied!",
        description: "Game results copied to clipboard",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-0 top-0">
            <X className="w-4 h-4" />
          </Button>
          <DialogTitle className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">Game Complete!</h2>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Winner Celebration */}
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 p-6 text-center text-white rounded-xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-3xl">{winner.avatar}</div>
              {winner.isHost && <Crown className="w-8 h-8" />}
              <h3 className="text-2xl font-bold">{winner.name} Wins!</h3>
            </div>
            <Badge className="text-xl px-6 py-2 bg-white/20 border-white/30 text-white">{winner.score} points</Badge>
          </div>

          {/* Top 3 Players */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedPlayers.slice(0, 3).map((player, index) => {
              const scoreProgress = (player.score / maxScore) * 100

              return (
                <Card
                  key={player.id}
                  className={`${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300"
                      : index === 1
                        ? "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300"
                        : "bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300"
                  } border-2`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2">{getRankIcon(index)}</div>
                    <div className="text-2xl mb-2">{player.avatar}</div>
                    <h4 className="font-bold text-lg">{player.name}</h4>
                    <Badge className="text-lg font-bold px-3 py-1 mb-2">{player.score}</Badge>
                    <Progress value={scoreProgress} className="h-2 mb-2" />
                    <div className="text-xs text-gray-600">{player.correctGuesses} correct guesses</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Detailed Stats Toggle */}
          <div className="text-center">
            <Button variant="outline" onClick={() => setShowDetails(!showDetails)} className="gap-2">
              <Star className="w-4 h-4" />
              {showDetails ? "Hide" : "Show"} Detailed Stats
            </Button>
          </div>

          {/* Detailed Player Stats */}
          {showDetails && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-center">All Players</h3>
              {sortedPlayers.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getRankIcon(index)}
                    <div className="text-xl">{player.avatar}</div>
                    <div>
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-sm text-gray-600">
                        {player.correctGuesses}/{gameData.settings.rounds} correct
                      </div>
                    </div>
                  </div>
                  <Badge className="text-lg px-3 py-1">{player.score}</Badge>
                </div>
              ))}
            </div>
          )}

          {/* Game Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Game Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{gameData.settings.rounds}</p>
                  <p className="text-sm text-gray-600">Rounds</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{gameData.players.length}</p>
                  <p className="text-sm text-gray-600">Players</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {gameData.players.reduce((sum, p) => sum + p.correctGuesses, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Guesses</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round((gameData.settings.timePerRound * gameData.settings.rounds) / 60)}m
                  </p>
                  <p className="text-sm text-gray-600">Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => {
                onPlayAgain()
                onClose()
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Play Again
            </Button>
            <Button
              onClick={() => {
                onBackToLobby()
                onClose()
              }}
              variant="outline"
            >
              New Game
            </Button>
            <Button onClick={shareResults} variant="outline" className="gap-1 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
