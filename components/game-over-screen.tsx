"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Crown, RotateCcw, Home, Share2, Download, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { GameData } from "@/app/page"

interface GameOverScreenProps {
  gameData: GameData
  onPlayAgain: () => void
  onBackToLobby: () => void
}

export default function GameOverScreenProps({gameData, onPlayAgain, onBackToLobby}: GameOverScreenProps){
  const sortedPlayers= [...gameData.players].sort((a,b)=> b.score - a.score);
  const winner= sortedPlayers[0];
  const maxScore= Math.max(...gameData.players.map((p)=> p.score), 1);

  const {toast}= useToast();

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

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg"
      case 1:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
      case 2:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
      default:
        return "bg-white border-gray-200"
    }
  }

    const shareResults = () => {
    const results =
      `🦕 Drawsurus Game Results!\n\n🏆 Winner: ${winner.username} (${winner.score} points)\n\n` +
      sortedPlayers
        .slice(0, 3)
        .map((p, i) => `${i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} ${p.username}: ${p.score} points`)
        .join("\n") +
      `\n\nPlay Drawsurus now! 🎨`

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



  const downloadResults = () => {
    const results = {
      gameId: gameData.gameId,
      winner: winner.username,
      players: sortedPlayers.map((p) => ({
        name: p.username,
        score: p.score,
        correctGuesses: p.correctGuesses,
        avatar: p.avatar,
      })),
      settings: gameData.settings,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `drawsurus-results-${gameData.gameId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }


  const getPlayerAchievements = (player: (typeof sortedPlayers)[0], index: number) => {
    const achievements = []

    if (index === 0) achievements.push({ icon: "🏆", text: "Winner!" })
    if (player.correctGuesses === gameData.settings.roundsPerGame) achievements.push({ icon: "🎯", text: "Perfect Guesser" })
    if (player.score > 100) achievements.push({ icon: "💯", text: "High Scorer" })
    if (player.isHost) achievements.push({ icon: "👑", text: "Host" })

    return achievements
  }

  return(
     <div className="max-w-4xl mx-auto space-y-6">
      {/* Winner Celebration */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 p-6 text-center text-white">
          <div className="mb-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold mb-2">Game Complete!</h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-3xl">{winner.avatar}</div>
              {winner.isHost && <Crown className="w-8 h-8" />}
              <h3 className="text-3xl font-bold">{winner.username} Wins!</h3>
            </div>
            <Badge className="text-xl px-6 py-2 bg-white/20 border-white/30 text-white">{winner.score} points</Badge>
          </div>

          <div className="flex justify-center gap-4 text-sm">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="font-bold">{winner.correctGuesses}</div>
              <div>Correct Guesses</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="font-bold">{Math.round(winner.score / gameData.settings.roundsPerGame)}</div>
              <div>Avg Points/Round</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="font-bold">{Math.round((winner.correctGuesses / gameData.settings.roundsPerGame) * 100)}%</div>
              <div>Accuracy</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Final Leaderboard */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Final Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => {
              const scoreProgress = (player.score / maxScore) * 100
              const achievements = getPlayerAchievements(player, index)

              return (
                <div
                  key={player.userId}
                  className={`p-6 rounded-xl ${getRankColor(index)} transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {getRankIcon(index)}
                      <div className="text-3xl">{player.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {player.isHost && <Crown className="w-5 h-5 text-yellow-300" />}
                          <span className={`font-bold text-xl ${index < 3 ? "text-white" : "text-gray-800"}`}>
                            {player.username}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {achievements.map((achievement, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className={`text-xs ${index < 3 ? "bg-white/20 text-white border-white/30" : ""}`}
                            >
                              {achievement.icon} {achievement.text}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        className={`font-bold text-2xl px-4 py-2 ${
                          index < 3 ? "bg-white/20 text-white border-white/30" : "bg-gray-100"
                        }`}
                      >
                        {player.score}
                      </Badge>
                      <p className={`text-sm mt-1 ${index < 3 ? "text-white/80" : "text-gray-500"}`}>points</p>
                    </div>
                  </div>

                  {/* Detailed Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className={`font-bold ${index < 3 ? "text-white" : "text-gray-800"}`}>
                        {player.correctGuesses}
                      </div>
                      <div className={`text-xs ${index < 3 ? "text-white/80" : "text-gray-500"}`}>Correct</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold ${index < 3 ? "text-white" : "text-gray-800"}`}>
                        {Math.round(player.score / Math.max(gameData.settings.roundsPerGame, 1))}
                      </div>
                      <div className={`text-xs ${index < 3 ? "text-white/80" : "text-gray-500"}`}>Avg/Round</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold ${index < 3 ? "text-white" : "text-gray-800"}`}>
                        {Math.round((player.correctGuesses / gameData.settings.roundsPerGame) * 100)}%
                      </div>
                      <div className={`text-xs ${index < 3 ? "text-white/80" : "text-gray-500"}`}>Accuracy</div>
                    </div>
                  </div>

                  {/* Score Progress */}
                  <Progress value={scoreProgress} className={`h-3 ${index < 3 ? "bg-white/20" : ""}`} />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Game Statistics */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Game Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">{gameData.settings.roundsPerGame}</p>
              <p className="text-sm text-gray-600">Rounds Played</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{gameData.players.length}</p>
              <p className="text-sm text-gray-600">Total Players</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">
                {gameData.players.reduce((sum, p) => sum + p.correctGuesses, 0)}
              </p>
              <p className="text-sm text-gray-600">Correct Guesses</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">
                {Math.round((gameData.settings.roundTime * gameData.settings.roundsPerGame) / 60)}m
              </p>
              <p className="text-sm text-gray-600">Game Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={onPlayAgain}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 text-lg font-semibold shadow-lg"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Play Again
        </Button>

        <Button
          onClick={onBackToLobby}
          variant="outline"
          className="py-4 text-lg font-semibold border-2 bg-white/50 backdrop-blur-sm"
        >
          <Home className="w-5 h-5 mr-2" />
          New Game
        </Button>

        <Button
          onClick={shareResults}
          variant="outline"
          className="py-4 text-lg font-semibold border-2 bg-white/50 backdrop-blur-sm"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Results
        </Button>

        <Button
          onClick={downloadResults}
          variant="outline"
          className="py-4 text-lg font-semibold border-2 bg-white/50 backdrop-blur-sm"
        >
          <Download className="w-5 h-5 mr-2" />
          Save Results
        </Button>
      </div>
    </div>
  )

}