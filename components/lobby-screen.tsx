"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Settings, Crown, Check, X, UserX, Copy, Share2, Gamepad2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Player, GameSettings } from "@/utils/types/game"
import KeywordUpload from "@/components/keyword-upload"

interface LobbyData {
  players: Player[]
  settings: GameSettings
  gameId: string
  roomCode?: string
  status?: "waiting" | "playing" | "completed"
}

interface LobbyScreenProps {
  gameData: LobbyData
  currentPlayer: Player | null
  customWords: string[]
  onUpdateCustomWords: (words: string[]) => void
  onJoinGame: (playerName: string, isHost?: boolean) => void
  onStartGame: () => void
  onUpdateSettings: (settings: GameSettings) => void
  onToggleReady: (playerId: string) => void
  onKickPlayer: (playerId: string) => void
}

export default function LobbyScreen({
  gameData, // Now only contains: players, settings, gameId (no unnecessary game state!)
  currentPlayer,
  customWords,
  onUpdateCustomWords,
  onJoinGame,
  onStartGame,
  onUpdateSettings,
  onToggleReady,
  onKickPlayer,
}: LobbyScreenProps) {
  const [playerName, setPlayerName] = useState("")
  const [gameCode] = useState(gameData.gameId.toUpperCase())
  const { toast } = useToast()

  const handleJoin = () => {
    if (playerName.trim()) {
      onJoinGame(playerName.trim(), gameData.players.length === 0)
    }
  }

  const handleCreateGame = () => {
    if (playerName.trim()) {
      onJoinGame(playerName.trim(), true)
    }
  }

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode)
    toast({
      title: "Game Code Copied!",
      description: "Share this code with friends to join your game.",
    })
  }

  const shareGame = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join my Drawsurus game!",
        text: `Join my drawing game with code: ${gameCode}`,
        url: window.location.href,
      })
    } else {
      copyGameCode()
    }
  }

  // Remove backend constraint - any number of players can start
  const canStartGame = currentPlayer?.isHost && gameData.players.length > 0

  if (!currentPlayer) {
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
                onKeyPress={(e) => e.key === "Enter" && handleJoin()}
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

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs defaultValue="players" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/20 backdrop-blur-sm">
          <TabsTrigger value="players" className="data-[state=active]:bg-white/90">
            <Users className="w-4 h-4 mr-2" />
            Players ({gameData.players.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white/90">
            <Settings className="w-4 h-4 mr-2" />
            Game Settings
          </TabsTrigger>
          <TabsTrigger value="keywords" className="data-[state=active]:bg-white/90">
            Keywords ({customWords.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-6">
          {/* Game Info Card */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-lg px-4 py-2 bg-purple-100 border-purple-300">
                    Game Code: {gameCode}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyGameCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={shareGame}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Badge variant="secondary" className="text-sm">
                  {gameData.settings.roundsPerGame} Rounds • {gameData.settings.roundTime}s Each
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Players Grid */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Players in Lobby ({gameData.players.length}/{gameData.settings.maxPlayers})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameData.players.map((player) => (
                  <div
                    key={player.userId}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{player.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          {player.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
                          <span className="font-semibold text-gray-800">{player.username}</span>
                        </div>
                        <p className="text-xs text-gray-500">{player.isHost ? "Host" : "Player"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {player.isReady ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <Check className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <X className="w-3 h-3 mr-1" />
                          Not Ready
                        </Badge>
                      )}

                      {currentPlayer.isHost && !player.isHost && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onKickPlayer(player.userId)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: Math.max(0, (gameData.settings.maxPlayers || 8) - gameData.players.length) }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl"
                    >
                      <span className="text-gray-400">Waiting for player...</span>
                    </div>
                  ),
                )}
              </div>

              {/* Player Actions */}
              <div className="mt-6 flex justify-center gap-4">
                {currentPlayer && !currentPlayer.isHost && (
                  <Button
                    onClick={() => onToggleReady(currentPlayer.userId)}
                    variant={currentPlayer.isReady ? "outline" : "default"}
                    className={`px-8 py-3 text-lg font-semibold ${
                      currentPlayer.isReady
                        ? "border-2"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    }`}
                  >
                    {currentPlayer.isReady ? "Cancel Ready" : "Ready to Play!"}
                  </Button>
                )}

                {currentPlayer.isHost && (
                  <Button
                    onClick={onStartGame}
                    disabled={!canStartGame}
                    className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
                  >
                    🚀 Start Game!
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {currentPlayer?.isHost ? (
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle>Customize Your Game</CardTitle>
                <p className="text-gray-600">Adjust settings to create the perfect experience</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Number of Rounds: {gameData.settings.roundsPerGame}
                      </label>
                      <Slider
                        value={[gameData.settings.roundsPerGame]}
                        onValueChange={([value]) => onUpdateSettings({ ...gameData.settings, roundsPerGame: value })}
                        min={1}
                        max={10}
                        step={1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Quick (1)</span>
                        <span>Epic (10)</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Time per Round: {gameData.settings.roundTime}s
                      </label>
                      <Slider
                        value={[gameData.settings.roundTime]}
                        onValueChange={([value]) => onUpdateSettings({ ...gameData.settings, roundTime: value })}
                        min={30}
                        max={180}
                        step={15}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Fast (30s)</span>
                        <span>Relaxed (3m)</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Max Players: {gameData.settings.maxPlayers || 8}
                      </label>
                      <Slider
                        value={[gameData.settings.maxPlayers || 8]}
                        onValueChange={([value]) => onUpdateSettings({ ...gameData.settings, maxPlayers: value })}
                        min={2}
                        max={12}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Difficulty Level</label>
                      <Select
                        value={gameData.settings.wordDifficulty}
                        onValueChange={(value: "easy" | "medium" | "hard") =>
                          onUpdateSettings({ ...gameData.settings, wordDifficulty: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">🟢 Easy (More hints)</SelectItem>
                          <SelectItem value="medium">🟡 Medium (Some hints)</SelectItem>
                          <SelectItem value="hard">🔴 Hard (Fewer hints)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Word Category</label>
                      <Select
                        value={gameData.settings.category}
                        onValueChange={(value: GameSettings["category"]) =>
                          onUpdateSettings({ ...gameData.settings, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">🌟 All Categories</SelectItem>
                          <SelectItem value="animals">🐾 Animals</SelectItem>
                          <SelectItem value="objects">📦 Objects</SelectItem>
                          <SelectItem value="actions">🏃 Actions</SelectItem>
                          <SelectItem value="food">🍕 Food</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Custom Words</label>
                        <p className="text-xs text-gray-500">Allow custom words in the game</p>
                      </div>
                      <Switch
                        checked={gameData.settings.allowCustomWords || false}
                        onCheckedChange={(checked) => onUpdateSettings({ ...gameData.settings, allowCustomWords: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="py-12 text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Settings Locked</h3>
                <p className="text-gray-500">Only the host can modify game settings</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="keywords" className="space-y-6">
          <KeywordUpload customWords={customWords} onUpdateWords={onUpdateCustomWords} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
