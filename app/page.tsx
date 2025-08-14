"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { Toaster } from "@/components/ui/toaster"
import LobbyScreen from "@/components/lobby-screen"
import GameScreen from "@/components/game-screen"
import GameOverScreen from "@/components/game-over-screen"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import ApiService, { roundDetails, SingleGameResponse } from "@/lib/api"
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
  Word,
  User
} from "@/utils/types/game"
import { allowedNodeEnvironmentFlags } from "process"

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

const AVATARS = ["🦕", "🎨", "🌟", "🎯", "🚀", "🎪", "🎭", "🎨", "🦄", "🌈", "⭐", "🎊"]

export default function DrawsurusGame(){
  const apiService = useMemo(() => new ApiService(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"), []);
  
  const guestUsername = "Guest Player " + Math.random().toString(36).substr(2, 5);
   const [gameState, setGameState] = useState<GameState>("lobby")
   const [showJoinScreen, setShowJoinScreen]= useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const { toast } = useToast()
    const [gamePlayData, setGamePlayData] = useState<GamePlayData | null>(null)
  const [winner, setWinner] = useState<Player | undefined>(undefined)

  const [customWords, setCustomWords] = useState<string[]>([])

  const { user, isLoading } = useAuth()
  const hasJoinedRef = useRef(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
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

  // const createGuestPlayer = useCallback(
  //   async (username: string, isHost: boolean, enterpriseTag?: string) => {
  //     const apiService = new ApiService("http://localhost:5000");
      
  //     const guestUserResponse = await apiService.createGuestUser({
  //       userName: username,
  //       enterpriseTag: enterpriseTag || "drawsurus"
  //     });

  //     if (guestUserResponse.status === 201 && guestUserResponse.data) {
  //       alert("Guest User Created Successfully");

  //       const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];

  //       const guestPlayer: Player = {
  //         userId: guestUserResponse.data.id,
  //         username: username || "Guest Player",
  //         score: 0,
  //         isReady: true,
  //         isHost: isHost || false,
  //         avatar: randomAvatar,
  //         correctGuesses: 0,
  //         drawings: 0,
  //         joinedAt: new Date().toISOString(),
  //       };

  //       setCurrentPlayer(guestPlayer);
  //       setLobbyData((prev) => ({
  //         ...prev,
  //         players: [...prev.players, guestPlayer],
  //       }));
  //     } else {
  //       alert("Failed to create guest user. Please try again later.");
  //     }
  //   },[]
  // );

  // useEffect(() => {
  //   // Check for guest mode from localStorage
  //   const guestMode = localStorage.getItem("guestMode");
  //   if (guestMode === "true" && !currentPlayer && !hasJoinedRef.current) {
  //     hasJoinedRef.current = true;
  //     setIsGuestMode(true);
  //     createGuestPlayer(guestUsername, true, "drawsurus"); // Create guest player
  //     // handleJoinGame("Guest Player", true);
  //     localStorage.removeItem("guestMode"); // Clear the flag
  //   } else if (user && !currentPlayer && !hasJoinedRef.current) {
  //     hasJoinedRef.current = true;
  //     const playerName = user.userName;
  //     // handleJoinGame(playerName, true); // Auto-create game as host
  //   }
  // }, [user, currentPlayer]);

  // Function to refresh user details from server
  const refreshUserDetails = useCallback(async () => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      try {
        const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
        const userData = await apiService.getCurrentUser();
        if(userData.status== 200 && userData.data?._id){
       
          // setting the state of the Player details as the logged In
          const playerDetails: Player= {
            userId: userData.data?._id,
            username: userData.data.userName,
            isHost: false,
            isReady: false,
            joinedAt: Date.now().toString(),
            score: 0,
            correctGuesses: 0,
            drawings: 0
          };
          setCurrentPlayer(playerDetails);
          setGameState("lobby");
        }
        return userData
      } catch (error) {
        console.error("Failed to refresh user details:", error)
        return null
      }
    }
  }, [])

  // useEffect(()=>{
  //   alert(showJoinScreen);
  // }, [showJoinScreen]);

  useEffect(() => {
    refreshUserDetails();
  }, [refreshUserDetails]);

  // useEffect(()=>{
  //   alert("Custom Word are created");
  // }, [customWords]);

  

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

  // this one function is used for the purpose of the creation of the Room or joining the users in a already created room
  const handleJoinGame= useCallback(async(
    playerName: string,
    isHost: boolean,
    playerDetails: Player,
    roomCode?: string
  )=>{
    console.log("the data of the user is defined as the", playerName,isHost);
    if(!playerName?.trim()){
       toast({
        title: "Invalid Player Name",
        description: "Please enter a valid player name.",
        variant: "destructive",
      });
      return;
    }

    try{
        const randomAvatar= AVATARS[Math.floor(Math.random()*AVATARS.length)];
      if(currentPlayer== null){
        return;
      }
      console.log("setting the data of the players is defined as the ", isHost, playerName, playerDetails.userId);
        const newPlayer: Player = {
                userId: playerDetails.userId,
                username: playerName,
                score: 0,
                isReady: isHost,
                isHost,
                avatar: randomAvatar,
                correctGuesses: 0,
                drawings: 0,
                joinedAt: new Date().toISOString(),
              };
          
        if(isHost){
          const roomData: Room= {
            hostId: newPlayer.userId,
            maxPlayers: LobbyData.players.length,
            players: LobbyData.players,
            status: "waiting",
            settings: LobbyData.settings,
            enterpriseTag: "drawsurus",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          const roomResponse= await apiService.createRoom(roomData);
          console.log("the response of the creating a new room is defined as the", roomResponse.data);
          console.log(roomResponse.status, roomResponse.data, roomResponse.data?._id, roomResponse.data?.roomCode)
          console.log(newPlayer);
          if(roomResponse.status== 201 && roomResponse.data && roomResponse.data._id && roomResponse.data.roomCode){
            // setCurrentPlayer(newPlayer);
            console.log("setitng the details of the lobby");
            setLobbyData({
              roomId: roomResponse.data?._id,
              players: [newPlayer],
              settings: roomResponse.data.settings,
              gameId: null,
              roomCode: roomResponse.data?.roomCode,
              status: "waiting"
          });
          setCurrentPlayer(newPlayer);
         }
        }
        else if(roomCode){
            const joinResponse= await apiService.joinRoom(roomCode);
            if(joinResponse.status == 200 && joinResponse.data){
              // setCurrentPlayer(newPlayer);
              setLobbyData((prev)=>({
                ...prev,
                players: [...prev.players, newPlayer],
                settings: joinResponse.data.settings,
                gameId: joinResponse.data.currentGameId || "",
                roomCode: joinResponse.data.roomCode,
                status: joinResponse.data.status
              }));
            }
        }
      setShowJoinScreen(false);
      toast({
              title: isHost ? "Room Created!" : "Joined Room!",
              description: `Welcome ${playerName}! ${isHost ? "You're the host." : ""}`,
            });
      setGameState("lobby");
      }
    catch(error){
      console.error('Join game error:', error);
      toast({
        title: "Error",
        description: "Failed to join game. Please try again.",
        variant: "destructive",
      });
    }
  }, [ [apiService, currentPlayer, LobbyData, toast]]);



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
          var wordsResponse;
        //   if(customWords.length== 0){
        //        wordsResponse=  await apiService.getWords({
        //           category: "all",
        //            difficulty: "medium"
        //        });      
        //       if(wordsResponse.status && wordsResponse.data){
        //           // setCustomWords(wordsResponse.data);
        //       }

        //       if(wordsResponse.status != 200 && !wordsResponse.data?.length){
        //       toast({
        //           title: "Error",
        //           description: "Failed to Fetch words. PLease try again",
        //             variant: "destructive"
        //         });
        //     return;
        //   }
        // }
         
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
    setGameState("lobby");
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
                
                // createGuestPlayer("vinay Jain", false);
                // handleJoinGame()
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

         {gameState == "lobby" && currentPlayer  && (
          <LobbyScreen
            gameData={LobbyData}
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
             showJoinScreen={showJoinScreen} // ✅ pass the state
            setShowJoinScreen={setShowJoinScreen}
          />
        )} 

         {gameState === "game" && currentPlayer && gamePlayData && (
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
        )} 
      </div>
      <Toaster />
    </div>
  )
}