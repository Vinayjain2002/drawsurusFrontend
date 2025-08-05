"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Crown, Palette, Target, Zap } from "lucide-react"
import type { Player } from "@/app/page"

interface ScoreboardProps {
  players: Player[]
  currentRound: number
}

export default function Scoreboard({ players, currentRound }: ScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const maxScore = Math.max(...players.map((p) => p.score), 1)

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 1:
        return <Trophy className="w-4 h-4 text-gray-400" />
      case 2:
        return <Trophy className="w-4 h-4 text-amber-600" />
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-500 text-sm">#{index + 1}</span>
        )
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300"
      case 1:
        return "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300"
      case 2:
        return "bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300"
      default:
        return "bg-white border-gray-200 hover:bg-gray-50"
    }
  }

  const getPlayerStats = (player: Player) => {
    const accuracy = player.correctGuesses > 0 ? (player.correctGuesses / currentRound) * 100 : 0
    return {
      accuracy: Math.round(accuracy),
      avgPoints: player.score > 0 ? Math.round(player.score / Math.max(currentRound, 1)) : 0,
    }
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboard
          <Badge variant="outline" className="ml-auto">
            Round {currentRound}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => {
            const stats = getPlayerStats(player)
            const scoreProgress = (player.score / maxScore) * 100

            return (
              <div key={player.id} className={`p-4 rounded-xl border-2 transition-all ${getRankColor(index)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getRankIcon(index)}
                    <div className="text-2xl">{player.avatar}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        {player.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
                        {player.isDrawing && <Palette className="w-4 h-4 text-purple-500" />}
                        <span className="font-semibold text-gray-800">{player.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>{player.correctGuesses} correct</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{stats.avgPoints} avg</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={`font-bold text-lg px-3 py-1 ${
                        index === 0 ? "bg-yellow-500 text-white border-yellow-500" : ""
                      }`}
                    >
                      {player.score}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">points</p>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="mt-3">
                  <Progress value={scoreProgress} className="h-2" />
                </div>

                {/* Player Status */}
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2">
                    {player.isDrawing && (
                      <Badge className="bg-purple-500 text-xs">
                        <Palette className="w-3 h-3 mr-1" />
                        Drawing
                      </Badge>
                    )}
                    {player.isHost && (
                      <Badge variant="outline" className="text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Host
                      </Badge>
                    )}
                  </div>

                  {stats.accuracy > 0 && <span className="text-xs text-gray-500">{stats.accuracy}% accuracy</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Scoreboard Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-blue-600">{players.length}</p>
              <p className="text-xs text-gray-600">Players</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">
                {players.reduce((sum, p) => sum + p.correctGuesses, 0)}
              </p>
              <p className="text-xs text-gray-600">Total Guesses</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-600">{Math.max(...players.map((p) => p.score))}</p>
              <p className="text-xs text-gray-600">High Score</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
