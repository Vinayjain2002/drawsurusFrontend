"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { Toaster } from "@/components/ui/toaster"
import LobbyScreen from "@/components/lobby-screen"
import GameScreen from "@/components/game-screen"
import GameOverScreen from "@/components/game-over-screen"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ApiService, { roundDetails, SingleGameResponse } from "@/lib/api"
import {
  type Player,
  type Room,
  type Game,
  type GameSettings,
  type ChatMessage,
  type Drawing,
  type Round,
  type FinalScore,
  type UserStats,
  type Word,
  type User,
  type Difficulty,
  type uiState,
  type guestModeState,
  type PlayerRootState,
  AVATARS
} from "@/utils/types/game"
import { allowedNodeEnvironmentFlags } from "process"
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { useDispatch } from "react-redux"
import { setUserDetails } from "@/store/slices/userSlice"
import { setShowJoinScreen, toggleJoinScreen } from "@/store/slices/uiSlices"
import { setGuestMode } from "@/store/slices/GuestModeSlice"
import { setPlayerDetails } from "@/store/slices/playerSlice"

export type GameState = "lobby" | "game" | "gameOver"

export interface LobbyData {
  roomId: string | null
  players: Player[]
  settings: GameSettings
  gameId: string | null
  roomCode: string
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

export interface GameData extends LobbyData, GamePlayData {
  winner?: Player
}

 export  const generateWordHint = useCallback((word: string, difficulty: GameData["settings"]["wordDifficulty"]) => {
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
  }, []);

export default function DrawsurusGame(){
    const router = useRouter();
    const dispatch = useDispatch();
    const { isLoading } = useAuth();
    const { toast } = useToast()
    const apiService = useMemo(() => new ApiService(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"), []);
    const user= useSelector((state: RootState)=> state.user);
  const isGuestMode = useSelector((state:  guestModeState)=> state.guestMode.isGuestMode);
  console.log("the guest mode is defined as the", isGuestMode);


    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
    const [gameState, setGameState] = useState<GameState>("lobby")
    const [LobbyData, setLobbyData]= useState<LobbyData>({
        roomId: null,
      players:[],
      settings: {
        roundTime: 30,
        roundsPerGame: 3,
        wordDifficulty: "medium",
        maxPlayers: 8
      },
      gameId: null,
      roomCode: ""
      });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const guestMode = localStorage.getItem("guestMode");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj?.userName && userObj?.email) {
          dispatch(setUserDetails({
            userName: userObj.userName,
            email: userObj.email,
          }));

          dispatch(setPlayerDetails({
            userId: userObj._id,
            username: userObj.userName,
            isHost: false,
            avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
            joinedAt: new Date().toISOString(),
          }))
        }
        dispatch(setShowJoinScreen(false));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    else if(guestMode == "true"){
      dispatch(setGuestMode({isGuestMode: true}));                
      dispatch(setShowJoinScreen(true));
    }
  }, [dispatch]);



    const handleUpdateCustomWords = async (words: string[], difficulty: Difficulty ) => {
      // 1. Update state immediately for instant UI feedback
      setCustomWords(words);

      // 2. Save to DB
      try {
    const formattedWords = words.map(word => ({
      word: word.trim(),
      category: "custom",           // default category
      difficulty: difficulty,       // passed in as argument
      isActive: true                // default value
    }));

        const res = await apiService.createWords(formattedWords); // create this API method
        if (res.success) {
          toast({ title: "Custom words saved!" });
        } else {
          toast({ title: "Failed to save custom words", variant: "destructive" });
        }
      } catch (err) {
        console.error("Error saving custom words:", err);
        toast({ title: "Server error", variant: "destructive" });
      }
    };

  
  const getRandomWord = useCallback(
    async (category: string | undefined) => {
      if (customWords.length > 0) {
        return customWords[Math.floor(Math.random() * customWords.length)];
      } else {
        const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
        const wordsResponse = await apiService.getWords({
          category: category || "all",
          difficulty: "medium"
        });

        if (wordsResponse.data && wordsResponse.data.length > 0) {
          const picked=  wordsResponse.data[Math.floor(Math.random() * wordsResponse.data.length)];
          return typeof picked=="string"? picked : picked.word;
        } else {
          console.error("No words found for the selected category or difficulty");
          return "DRAWING"; // Fallback word
        }
      }
    },
    [customWords]
  );




  const handleStartGame= useCallback(async()=>{
      if(!LobbyData.roomId || !LobbyData.roomCode || !currentPlayer?.isHost){
        return;
      }
      try{
          const readyPlayer= LobbyData.players.filter(p=> p.isReady || p.isHost);
          if(readyPlayer.length == 0){
            toast({
              title: "cannot start Game",
              description: "Need at least 2 ready Players!",
              variant: "destructive"
            });
            return;
          }
         
          const firstDrawer= readyPlayer[0];
         const gameRequest: Game = {
            roomId: LobbyData.roomId,
            rounds: [],
            status: "playing",
            settings: LobbyData.settings,
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

            const wordHint= generateWordHint(wordData, LobbyData.settings.wordDifficulty);
            setGamePlayData({
              currentRound: 1,
              currentDrawer: firstDrawer.userId,
              currentWord: wordData,
              wordHint,
              timeLeft: LobbyData.settings.roundTime,
              roundStartTime: Date.now()
            });

            // need to update the data of the Game in the Game
            const roundDetails: roundDetails = {
                roundNumber: 1,
                word: wordData,
                drawerId: firstDrawer.userId,
                startTime: Date.now().toString(),
                duration: LobbyData.settings.roundTime
            }

            const updateGameResponse= await apiService.updateRoomDetails({gameId: gameResponse.data._id, roundDetails: roundDetails});
            if(updateGameResponse){

            }
            setGameState("game");
            toast({
              title: "Game Started",
              description: `${firstDrawer.username} is drawing first!`
            })
            setLobbyData((prev)=>({
              ...prev,
              players: prev.players.map((p)=>({
                ...p,
                isDrawing: p.userId=== firstDrawer.userId
              }))
            }));
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
  }, [apiService, LobbyData, currentPlayer, generateWordHint, toast]);

  const handleGameEnd= useCallback((winner: Player)=>{
    setWinner(winner);
    setGameState("gameOver");
       toast({
        title: "🎉 Game Over!",
        description: `${winner.username} wins with ${winner.score} points!`,
      })
  }, [toast]);


   const handlePlayAgain = useCallback(() => {
    setGamePlayData(null)
    setWinner(undefined)
    setLobbyData((prev) => ({
      ...prev,
      status: "waiting",
      players: prev.players.map((p) => ({
        ...p,
        score: 0,
        isReady: p.isHost, // Only host is ready by default
        correctGuesses: 0,
        isDrawing: false,
      })),
    }))
    setGameState("lobby")
  }, []);

  const handleBackToLobby= useCallback(()=>{
    setShowJoinScreen(true);
    setCurrentPlayer(null);
    setGamePlayData(null);
    setWinner(undefined);
     setLobbyData((prev) => ({
      ...prev,
      players: [],
      gameId: Math.random().toString(36).substr(2, 9),
    }))
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // this is the First Screen Which we get when the normal Users Join
 
    if ( !user.email && !user.userName && !isGuestMode) {
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
                dispatch(setGuestMode({isGuestMode: true}));     
                localStorage.setItem("guestMode", "true");           
                router.push("/");
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

         {
         gameState == "lobby"  && (
          <LobbyScreen
            gameData={LobbyData}
            onUpdateCustomWords={handleUpdateCustomWords}
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

         {/* {gameState === "game" && currentPlayer && gamePlayData && (
          <GameScreen
            gameData={{ ...LobbyData, ...gamePlayData }}
            currentPlayer={currentPlayer}
            onGameEnd={handleGameEnd}
            onUpdateGameData={(updater) => {
              // Create a combined game data for the updater function
              const combinedGameData: GameData = { ...LobbyData, ...gamePlayData!, winner }

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
            gameData={{ ...LobbyData, ...gamePlayData!, winner }} 
            onPlayAgain={handlePlayAgain} 
            onBackToLobby={handleBackToLobby} 
          />
        )}  */}
      </div>
      <Toaster />
    </div>
  )
}