export interface Player {
  userId: string
  username: string
  isHost: boolean
  isReady: boolean
  avatar?: string
  isDrawing?: boolean
  joinedAt: string // ISO date string
  score: number
  correctGuesses: number
  drawings: number
}

// Stroke (Drawing)
export interface Stroke {
  x: number
  y: number
  pressure: number
  color: string
  width: number
  timestamp: number
}

// Drawing
export interface Drawing {
  drawingId: string
  strokes: Stroke[]
  canvasWidth?: number
  canvasHeight?: number
  drawingTime?: number
  createdAt?: string
  completedAt?: string | null
  drawerId?: string
  drawerUsername?: string
  word?: string
}

// Chat/Guess/System Message
export type ChatMessageType = "chat" | "guess" | "system"
export interface ChatMessage {
  roomId?: string
  userId: string
  username: string
  message: string
  type: ChatMessageType
  gameId?: string | null
  roundNumber?: number | null
  timestamp: string // ISO date string
  isCorrectGuess?: boolean
  points?: number
  timeTaken?: number | null
}

// Correct Guess (for round)
export interface CorrectGuess {
  userId: string
  username: string
  guessTime: string // ISO date string
  timeTaken: number
  points: number
}

// Round
export interface Round {
  roundNumber: number
  word: string
  drawerId: string
  drawerUsername: string
  startTime: string
  endTime: string | null
  duration: number | null
  correctGuesses: CorrectGuess[]
  drawings: Drawing[]
  messages: ChatMessage[]
}

// Game Settings
export interface GameSettings {
  roundTime: number
  roundsPerGame: number
  wordDifficulty: "easy" | "medium" | "hard"
  allowCustomWords?: boolean
  maxPlayers?: number
  category?: string
}

// Final Score
export interface FinalScore {
  userId: string
  username: string
  totalScore: number
  correctGuesses: number
  drawings: number
  averageGuessTime: number
  rank: number
}

// Room
export interface Room {
  _id?: string
  roomCode?: string
  hostId: string
  maxPlayers: number
  players: Player[]
  currentGameId?: string | null
  status: "waiting" | "playing" | "completed"
  createdAt: string
  enterpriseTag: string
  settings: GameSettings
  updatedAt: string
}

// Game
export interface Game {
  _id?: string
  roomId: string
  rounds: Round[]
  gameStartedAt: string
  gameEndedAt: string | null
  status: "waiting" | "playing" | "completed" | "cancelled"
  settings: GameSettings
  finalScores: FinalScore[]
  enterpriseTag: string
  createdAt: string
  updatedAt: string
}

// User Stats
export interface UserStats {
  userId: string
  gamesPlayed: number
  gamesWon: number
  totalPoints: number
  avgGuessSpeed: number
  correctGuesses: number
  drawnWords: number
  lastGamePlayedAt: string | null
  enterpriseTag: string
  statistics: {
    totalRoundsPlayed: number
    totalRoundsWon: number
    fastestGuess: number | null
    longestDrawing: number | null
    averageDrawingTime: number
    totalDrawingTime: number
    totalGuessTime: number
    streakDays: number
    currentStreak: number
    lastPlayedDate: string | null
  }
  achievements: {
    name: string
    description: string
    unlockedAt: string
    icon: string
  }[]
  weeklyStats: {
    gamesPlayed: number
    points: number
    correctGuesses: number
    drawings: number
    weekStart: string | null
  }
  monthlyStats: {
    gamesPlayed: number
    points: number
    correctGuesses: number
    drawings: number
    monthStart: string | null
  }
}

// Word
export interface Word {
  word: string
  category?: string
  difficulty?: "easy" | "medium" | "hard"
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export interface User{
  id: string
  userName: string
  email: string
  passwordHash: string
  avatar: string
  createdAt: string
  isAdmin: true
  lastOnline: Date
  currentRoomId: string
  isOnline: boolean
  totalGamesPlayed: number
  totalWins: number
  enterpriseTag: string
  isGuest: boolean
}

export interface CompleteUserData{
  id: string
  userName: string
  email: string
  passwordHash: string
  avatar: string
  createdAt: string
  isAdmin: true
  lastOnline: Date
  currentRoomId: Room
  isOnline: boolean
  totalGamesPlayed: number
  totalWins: number
  enterpriseTag: string
}

export interface Sessions{
  userId: string
  id: string
  sessionId: string
  ip: string
  userAgent: string
  deviceInfo: string
  createdAt: Date
  expiresAt: Date
  lastActivity: Date
  isActive: boolean
  logoutAt: Date
}

