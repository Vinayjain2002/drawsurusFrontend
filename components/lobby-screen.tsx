"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useMemo, useState} from "react"
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
import { type Player, type GameSettings, type User, type Difficulty, type PlayerRootState, AVATARS, Room, WordRootState, Game } from "@/utils/types/game"
import KeywordUpload from "@/components/keyword-upload"
import { generateWordHint, LobbyData } from "@/app/page"
import { useDispatch, useSelector } from "react-redux"
import { max } from "date-fns"
import ApiService, { roundDetails } from "@/lib/api"
import { setShowJoinScreen, toggleJoinScreen } from "@/store/slices/uiSlices"
import { setUserDetails } from "@/store/slices/userSlice"
import { setPlayerDetails } from "@/store/slices/playerSlice"
import { RootState } from "@/store/store"
import { setCurrentDrawer, setGameState } from "@/store/slices/GameSlice"


interface LobbyScreenProps {
  gameData: LobbyData
  onUpdateSettings: (settings: GameSettings) => void
  onToggleReady: (playerId: string) => void
  onKickPlayer: (playerId: string) => void
  updateGameState: (state: string)=> void
}


export default function LobbyScreen({
  gameData,
  onUpdateSettings,
  onToggleReady,
  updateGameState,
  onKickPlayer,
}: LobbyScreenProps){
    const apiService = useMemo(() => new ApiService(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"), []);
  // Show loading state while auth is initializing
    const player=useSelector((state: PlayerRootState)=> state.player);
  const [playerName, setPlayerName]= useState(player.username);
  const [gameCode, setGameCode]= useState("");
  const dispatch= useDispatch();
  const showJoinScreen= useSelector((state: {ui: {showJoinScreen: boolean}})=> state.ui.showJoinScreen);
 const players = useSelector((state:RootState) => state.game.players);
  const roomId = useSelector((state: RootState) => state.game.roomId);
  const settings = useSelector((state: RootState) => state.game.settings);
  const roomCode= useSelector((state: RootState)=> state.game.roomCode);
  const isHost= useSelector((state: RootState)=> state.player.isHost);
const lobbyData= useSelector((state: RootState)=> state.game);
  useEffect(()=>{
    setGameCode(gameData.roomCode);
  }, [gameData]);

  const {toast}= useToast();
  const currentPlayer= useSelector((state: PlayerRootState)=> state.player);
  const customWords= useSelector((state: WordRootState)=> state.word.customWords);
  const  startGame =async ()=>{
    // apiService.createWords(customWords);
    console.log("Create Game is caled");
    if(!roomId || !roomCode || !isHost){
      toast({
        title: "Cannot Start Game",
        description: "You must"
      });
      return;
    }

    try{
          const readyPlayer= lobbyData.players.filter(p=> p.isReady || p.isHost);
          if(readyPlayer.length== 0){
            toast({
              title: "cannot start Game",
              description: "Need at least 2 ready Players!",
              variant: "destructive"
            });
            return;
          }
        const firstDrawer= readyPlayer[0];
        const gameRequest: Game = {
                      roomId: lobbyData.roomId ?? "",
                      rounds: [],
                      status: "playing",
                      settings: lobbyData.settings,
                      enterpriseTag: "drawsurus",
                      gameEndedAt: null,
                      createdAt: Date.now().toString(),
                      gameStartedAt: Date.now().toString(),
                      updatedAt: Date.now().toString(), // ✅ make sure to call Date.now()
                      finalScores: []
                    };
       const gameResponse= await apiService.createGame(gameRequest);
            if(gameResponse.status == 201 && gameResponse.data && gameResponse.data._id){
            console.log("custom words is defined as the ",customWords);
            const wordData= customWords[0];
            console.log("the word data is defined as the ", wordData);

            const wordHint= generateWordHint(wordData, lobbyData.settings.wordDifficulty);
            // setGameDa({
            //   currentRound: 1,
            //   currentDrawer: firstDrawer.userId,
            //   currentWord: wordData,
            //   wordHint,
            //   timeLeft: LobbyData.settings.roundTime,
            //   roundStartTime: Date.now()
            // });
            const roundDetails: roundDetails = {
                            roundNumber: 1,
                            word: wordData,
                            drawerId: firstDrawer.userId,
                            startTime: Date.now().toString(),
                            duration: lobbyData.settings.roundTime
                        }

            const updateGameResponse= await apiService.updateRoomDetails({gameId: gameResponse.data._id, roundDetails: roundDetails});
            
            toast({
              title: "Game Started",
              description: `${firstDrawer.username} is drawing first!`
            })
            dispatch(setCurrentDrawer(player.userId));
            if(updateGameResponse){
                updateGameState("start");
            }
          }

    }
    catch(err){
      console.error("Start Game Error", err);
           toast({
              title: "Error",
              description: "Failed to start game. Please try again.",
              variant: "destructive",
          });
    }
  }
  const handleJoin=async ()=>{
    if(playerName.trim()){
      // need to check the room Code and other things
      console.log("the no of the players is defined as the ", gameData.players.length);
      const randomAvatar= AVATARS[Math.floor(Math.random()*AVATARS.length)];
      const currentPlayer: Player= {
        userId: player.userId,
        username: playerName.trim(),
        isHost: gameData.players.length==0,
        isReady: false,
        avatar: randomAvatar,
        isDrawing: false,
        joinedAt: new Date().toISOString(),
        score: 0,
        correctGuesses: 0,
        drawings: 0
      }
      if(gameData.players.length == 0){
          const roomData: Room= {
            hostId: currentPlayer.userId,
            maxPlayers: gameData.settings.maxPlayers,
            players: [...gameData.players, currentPlayer],
            status: "waiting",
            settings: gameData.settings,
            createdAt: new Date().toISOString(),
            enterpriseTag: "drawsurus",
            updatedAt: new Date().toISOString()
          }
           const roomResponse= await apiService.createRoom(roomData);
          if(roomResponse.status== 201 && roomResponse.data && roomResponse.data._id && roomResponse.data.roomCode){
            const maxPlayers= roomResponse.data.maxPlayers;
              roomResponse.data.settings.maxPlayers= maxPlayers;
              
              // setLobbyData((prev)=>({
              //   ...prev,
              //   players: [...prev.players, newPlayer],
              //   settings: joinResponse.data.settings,
              //   gameId: joinResponse.data.currentGameId || "",
              //   roomCode: joinResponse.data.roomCode,
              //   status: joinResponse.data.status
              // }));
          }
        //  dispatch(setRoomData(roomResponse.data));  
         dispatch(toggleJoinScreen());
      }
      // onJoinGame(playerName.trim(), gameData.players.length==1 , "");
    }
    else{
      toast({
        title: "Invalid Player Name",
        description: "Please enter a valid player name.",
        variant: "destructive",
      });
    }
  }


  const copyGameCode= ()=>{
    navigator.clipboard.writeText(gameCode ?? "");
    toast({
      title: "Game Code Copied!",
      description: "Share this code with your friends to join the game.",
    });
  }

  const handleCreateGame=()=>{
    if(playerName.trim()){
      console.log("the handle Create game is called");
      // Going to create a new Player in the database
      dispatch(
        setUserDetails( {
          userName: playerName.trim(),
          email: "",
        })
      );
      localStorage.setItem("user", JSON.stringify({
        userName: playerName.trim(),
        email:"" 
      }));
      dispatch(setPlayerDetails({
        userId: "njgnefwofknr",
        username: playerName.trim(),
        isHost: false,
        avatar: AVATARS[Math.floor(Math.random()*AVATARS.length)],
        joinedAt: new Date().toISOString(),
      }));
      dispatch(setShowJoinScreen(false));
      localStorage.removeItem("guestMode");
    }
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

    const canStartGame = currentPlayer?.isHost && gameData.players.length > 0
console.log("the show join status on the lobby Screen is defined as the", showJoinScreen);
    if(showJoinScreen){
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
            Players ({gameData?.players.length})
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
                    onClick={startGame}
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
                        Time per Round: {gameData.settings.roundTime}
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
  );
}