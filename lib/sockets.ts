import { ChatMessage, Game, Player, Round, Stroke } from "@/utils/types/game";
import { useEffect, useRef } from "react";
import io, {Socket} from "socket.io-client";

export function useGameSocket(
    roomCode: string | undefined,
   handlers: {
    onPlayerJoin?: (player: Player) => void;
    onPlayerLeave?: (playerId: string) => void;
    onGameStart?: (gameData: Game) => void;
    onDrawing?: (strokeData: Stroke) => void;
    onMessage?: (message: ChatMessage) => void;
    onRoundEnd?: (roundData: Round) => void;
    onGameEnd?: (gameData: Game) => void;
  }
){
    const socketRef= useRef<Socket | null>(null);
    useEffect(() => {
        if(!roomCode){
            return;
        }

        socketRef.current= io(process.env.NEXT_PUBLIC_API_URL, {
            query: {roomCode}
        });

        const socket= socketRef.current;

        if(handlers.onPlayerJoin){
            socket.on("playerJoin", handlers.onPlayerJoin);
        }
        if (handlers.onPlayerLeave) {
        socket.on('playerLeave', handlers.onPlayerLeave);
        }
        if (handlers.onGameStart) {
        socket.on('gameStart', handlers.onGameStart);
        }
        if (handlers.onDrawing) {
        socket.on('drawing', handlers.onDrawing);
        }
        if (handlers.onMessage) {
        socket.on('message', handlers.onMessage);
        }
        if (handlers.onRoundEnd) {
        socket.on('roundEnd', handlers.onRoundEnd);
        }
     if (handlers.onGameEnd) {
      socket.on('gameEnd', handlers.onGameEnd);
    }

    return () => {
      socket.disconnect();
    };
    }, [roomCode, handlers]);

    return socketRef.current;
}


// import { useGameSocket } from '@/hooks/useGameSocket';

// // Add inside your component
// const socket = useGameSocket(lobbyData.roomCode, {
//   onPlayerJoin: (player) => {
//     setLobbyData(prev => ({
//       ...prev,
//       players: [...prev.players, player]
//     }));
//   },
//   onPlayerLeave: (playerId) => {
//     setLobbyData(prev => ({
//       ...prev,
//       players: prev.players.filter(p => p.userId !== playerId)
//     }));
//   },
//   onGameStart: (gameData) => {
//     setGamePlayData({
//       currentRound: gameData.rounds[0].roundNumber,
//       currentDrawer: gameData.rounds[0].drawerId,
//       currentWord: gameData.rounds[0].word,
//       wordHint: generateWordHint(gameData.rounds[0].word, gameData.settings.wordDifficulty),
//       timeLeft: gameData.settings.roundTime,
//       roundStartTime: Date.now(),
//     });
//     setGameState("game");
//   },
//   // ... add other handlers as needed
// });