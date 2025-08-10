import {  CompleteUserData, Game, GameSettings, Room, Stroke, User, UserStats, Word } from "@/utils/types/game"
import { error } from "console";

const API_BASE_URL= "http://localhost:5000"

export interface ApiResponse<T = any>{
    status: number,
    success: boolean,
    data?: T,
    message?: string,
    error?: string
}

export interface LoginData {
  token: string;
  user: User;
}

export interface LoginResponse {
  status?: number; // HTTP or custom status code
  success: boolean; // Whether the request was successful
  message?: string; // Optional server message
  data: LoginData | null;
  error?: string;   // Optional error message
}

export interface RegisterData{
  token: string;
  user: User;
}

export interface TokenData{
  token: string
}

export interface AuthResponse {
  status?: number; // HTTP or custom status code
  success: boolean; // Whether the request was successful
  message?: string; // Optional server message
  data: RegisterData | null;
  error?: string; 
}

export interface CompleteUserResponse{
  status?: number,
  success: boolean,
  message?: string,
  data: CompleteUserResponse | null,
  error?: string
}


export interface TokenResponse{
  status?: number;
  success: boolean;
  message?: string;
  data: TokenData |  null;
  error?: string
}

export interface SignUpRequest {
  userName: string;
  email: string;
  password: string;
  enterpriseTag?: string;
}

export interface UserResponse{
  status?: number;
  success: boolean;
  message?: string;
  data: User |  null;
  error?: string
}

export interface MultipleUserResponse{
  status?: number,
  success: boolean,
  message?: string,
  data: User[] | null,
  error?: string
}
export interface UserStatsResponse{
  status?: number,
  success: boolean,
  message?: string,
  data: UserStats | null,
  error?: string
}
export interface createRoomInterface{
  maxPlayers: number;
  settings: GameSettings | null
}

export interface RoomListResponse{
  status?: number;
  success: boolean;
  message?: string
  data: Room[] | null;
  error?: string
}

export interface SingleRoomResponse{
  status?: number;
  success: boolean;
  message?: string;
  data: Room | null;
  error?: string
}

export interface SingleGameResponse{
  status?: number,
  success: boolean,
  message?: string,
  data: Game | null,
  error?: string
}

export interface MultipleGameResponse{
  status?: number,
  success: boolean,
  message?: string,
  data: Game[] | null,
  error?: string
};

export interface guessResponse{
  isCorrect: boolean,
  points: number,
  timeTaken: number,
  word: string
}
export interface SubmitGuessResponse{
  status?: number,
  success: boolean,
  message?: string,
  data: guessResponse | null,
  error?: string
}


export interface WordResponse{
  status?: number,
  success: boolean,
  message?: string,
  data: Word |  null,
  error?: string
}

export interface MultipleWordResponse{
  status?: number,
  success: boolean,
  message?: string,
  data: Word[] |  null,
  error?: string
}

class ApiService{
    private baseURL: string
    private token: string | null = null

    constructor(baseURL: string){
        this.baseURL="http://localhost:5000"
        if(typeof window !== 'undefined'){
            this.token= localStorage.getItem("auth_token");
        }
    }

    setToken(token: string){
        this.token= token;
        if(typeof window !== "undefined"){
            localStorage.setItem("auth_token", token);
        }
    }

    clearToken(){
        this.token= null;
        if(typeof window !== 'undefined'){
            localStorage.removeItem("auth_token");
        }
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit={
            'Content-Type': 'application/json',
        }   
        if(this.token){
            headers["Authorization"]= `Bearer ${this.token}`
        }
       
        return headers;
    }

    // a generic message for the request
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
      ): Promise<ApiResponse<T>>{
        const url = `${this.baseURL}${endpoint}`;
        const config: RequestInit = {
            headers: this.getHeaders(),
            ...options
        }
        try{
            const response= await fetch(url, config);
            const data= await response.json();
            const status= response.status;
            data.status= status;
            return data;
        }
        catch(err){
            console.log("Api request failed: ", err);
            throw err;
        }
    }
    

    async login({ email, password }: { email: string; password: string }): Promise<LoginResponse> {
      const loginRequest = { email, password };
      const response = await this.request<LoginData>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginRequest),
      });
    
      if (response.success && response.data && response.data.token) {
        this.setToken(response.data.token);
      }
    
      return {
        status: response.status,
        success: response.success,
        message: response.message,
        data: response.data || null,
        error: response.error
      };
    }
    
      async signup(userData: SignUpRequest): Promise<AuthResponse> {
        alert("the data are defined as the");
        alert(userData);
        const response = await this.request<RegisterData>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(userData),
        })
       
        if (response.success && response.data && response.data.token) {
          this.setToken(response.data.token);
        }
        return {
          status: response.status,
          success: response.success,
          message: response.message,
          data: response.data || null,
          error: response.error
        }
      }

      async logout(): Promise<boolean> {
        try {
          await this.request('/auth/logout', {
            method: 'POST',
          })
          return true;
        } catch (error) {
          console.error('Logout request failed:', error)
        } finally {
        //   this.clearToken()
        return false;
        }
      }

      async refreshToken(): Promise<TokenResponse>{
        const response= await this.request<TokenData>("/auth/refresh", {
            method: 'POST'
        });
        
        if(response.success && response.data){
            this.setToken(response.data.token);
        }
        return {
          status: response.status,
          success: response.success,
          message: response.message,
          data: response.data ||  null,
          error: response.error
        }
      }


      async getCurrentUser(): Promise<UserResponse> {
        const response = await this.request<User>('/auth/profile',{
            method: 'GET'
        });
    
        return {
          status: response.status,
          success: response.success,
          message: response.message,
          data: response.data ||  null,
          error: response.error
        }
      }

      async updateProfile():  Promise<UserResponse> {
        const response= await this.request<User>("/auth/profile", {
            method: 'POST'
        });
        return {
          status: response.status,
          success: response.success,
          message: response.message,
          data: response.data ||  null,
          error: response.error
        }
      }
      // user routes
      async getUsersById({userId}: {userId: number}):Promise<UserResponse>{
        const response= await this.request<User>(`/user/${userId}`, {
          method: 'GET'
        });

        return {
          status: response.status,
          success: response.success,
          message: response.message,
          data: response.data ||  null,
          error: response.error
        }
      }

      async getUserStats({userId}: {userId: number}): Promise<UserStatsResponse>{
        const response= await this.request<UserStats>(`/user/stats/${userId}`, {
          method: "GET"
        });
        return {
          status: response.status,
          success: response.success,
          message: response.message,
          data: response.data || null,
          error: response.error
        }
      }

      async getOnlineUsers({enterpriseTag}: {enterpriseTag: string}): Promise<MultipleUserResponse>{
        const response= await this.request<User[]>(`/user/online`, {
          method: 'GET'
        });

        return {
          status: response.status,
          success:response.success,
          message:response.message,
          data: response.data ||  null,
          error: response.error
        }
      }

      async searchUsers({userName, enterpriseTag}: {userName: string, enterpriseTag: string}): Promise<MultipleUserResponse>{
          const response= await this.request<User[]>(`/user/search`, {
            method: "GET"
          });

          return {
            status: response.status,
            success: response.success,
            message: response.message,
            data: response.data || null,
            error: response.error
          }
      }


      async updateOnlineUsers({isOnline}: {isOnline: boolean}): Promise<UserResponse>{
          const response= await this.request<User>(`/user/onlineStatus`, {
            method: 'PUT'
          });

          return {
            success: response.success,
            status: response.status,
            data: response.data || null,
            message: response.message,
            error: response.error
          };
      }

      // async getCurrentRoom(): Promise<CompleteUserResponse>{
      //     const response= await this.request<CompleteUserData>(`/user/currentRoom`, {
      //       method: 'GET'
      //     });

      //     return {
      //       success: response.success,
      //       status: response.status,
      //       data: response ||  null,
      //       message: response.message,
      //       error: response.error
      //     };
      // }


      async leaveRoom(): Promise<ApiResponse>{
        const response= await this.request("/user/leaveroom", {
          method: "GET"
        });
        return{
          status: response.status,
          success: response.success,
          message: response.message,
          error: response.error
        }
      }
      // Words Controller



      // Game-related API methods
      async getGame({gameId}:{gameId: number}):Promise<SingleGameResponse>{
        const response= await this.request<Game>(`/game/${gameId}`,{
              method: "GET"
        });
        return {
          success: response.success,
          status: response.status,
          message: response.message,
          data: response.data || null,
          error: response.error
        };
      }

      async  getCurrentRound({gameId}: {gameId: number}): Promise<SingleGameResponse>{
        const response= await this.request<Game>(`/game/${gameId}`,{
          method: 'GET'
        });

        return {
          success: response.success,
          status: response.status,
          message: response.message,
          data: response.data || null,
          error: response.error
        };
      }

      async createGame(gameData: Game): Promise<SingleGameResponse>{
        const response= await this.request<Game>(`/game`, {
          method: 'POST',
          body: JSON.stringify(gameData)
        });

        return {
          success: response.success,
          status: response.status,
          message: response.message,
          data: response.data || null,
          error: response.error
        };
      }

      async submitDrawing({gameId, strokes}: {gameId: number, strokes: Stroke}): Promise<ApiResponse>{
        const response= await this.request(`/game/drawing/${gameId}`, {
          method: 'POST'
        });
        return {
          success: response.success,
          status: response.status,
          message: response.message,
          error: response.error
        }
      }

      async submitGuess({guessedWord, guessId}: {guessedWord: string, guessId: number}): Promise<SubmitGuessResponse>{
          const response= await this.request<guessResponse>(`/game/guess/${guessId}`, {
              method: "POST"
          });
          return {
            success: response.success,
            status: response.status,
            message: response.message,
            error: response.error,
            data: response.data || null
          }
      }


      async endRound({gameId}: {gameId:  number}): Promise<ApiResponse>{
        const response= await this.request(`/game/guess/${gameId}`, {
            method: "POST"
        });

        return {
          success: response.success,
          status: response.status,
          message: response.message,
          error: response.error
        };
      }

      // async getGameHIstory({}): Promise<ApiResponse>{

      // }

 
      // Words routes are defined as the
      async createWord(wordData: Word): Promise<WordResponse>{
        const response= await this.request<Word>(`/word`, {
          method: 'POST'
        });

        return {
          success: response.success,
          status: response.status,
          message: response.message,
          error: response.error,
          data: response.data || null
        };
      }

      async getWords({category, difficulty}: {category: string, difficulty: string}): Promise<MultipleWordResponse>{
          const response= await this.request<Word[]>(`/word`, {
            method: 'GET'
          });
          return {
            success: response.success,
            status: response.status,
            message: response.message,
            error: response.error,
            data: response.data || null
          };
      }

      async getWordsOnDifficulty({difficulty}: {difficulty: string}): Promise<WordResponse>{
          const response= await this.request<Word>(`word/difficulty`, {
            method: 'GET'
          });
          return {
            success: response.success,
            status: response.status,
            message: response.message,
            error: response.error,
            data: response.data || null
          }
      }

      async getTodayCreatedWords(): Promise<WordResponse>{
          const response= await this.request<Word>(`/word/todayCreated`,{
            method: 'GET'
          });

          return {
            success: response.success,
            status: response.status,
            message: response.message,
            error: response.error,
            data: response.data || null
          }
      }
      // Room-related API methods


      async createRoom(roomData: Room): Promise<SingleRoomResponse>{
        const response= await this.request<Room>("/room", {
          method: "POST"
        });

        return {
          status: response.status,
          success: response.success,
          message: response.message,
          data: response.data || null,
          error: response.error
        }
      }

      async updateRoomSettings(roomData: Room): Promise<SingleRoomResponse>{
        const response= await this.request<Room>(`/room/settings/${roomData._id}`, {
          method: "PUT"
        });
        return {
          status: response.status,
          success: response.success,
          message: response.message,
          data: response.data || null,
          error: response.error
        };
      }

      async getActiveRooms():Promise<RoomListResponse>{
        const response= await this.request<Room[]>("/room", {
          method: "GET"
        });
        return {
          status: response.status,
          success: response.success,
          message: response.message,
          data: response.data || null,
          error: response.error
        }
      }

      async startRoom({roomId}: {roomId: number}):Promise<SingleRoomResponse>{
        const response= await this.request<Room>(`/room/startGame/${roomId}`,{
          method: "POST"
        });
        return {
          success: response.success,
          status: response.status,
          message: response.message,
          data: response.data || null,
          error: response.error
        };
      } 

      async joinRoom(roomCode: string): Promise<ApiResponse<any>> {
        const response = await this.request('/api/rooms/join', {
          method: 'POST',
          body: JSON.stringify({ roomCode }),
        })
        
        if (response.success) {
          return response
        }
        throw new Error(response.message || 'Failed to join room')
      }

      async getRoomState(roomId: string): Promise<ApiResponse<any>> {
        const response = await this.request(`/api/rooms/${roomId}`, {
          method: 'GET'
        })
        
        if (response.success) {
          return response
        }
        throw new Error(response.message || 'Failed to get room state')
      }
      
      // Guest User Routes

     async createGuestUser({ userName, enterpriseTag }: { userName: string; enterpriseTag: string }): Promise<UserResponse> {
        const createGuestUserRequest = { userName, enterpriseTag };

        const response = await this.request<User>(`/user/guest`, {
          method: 'POST',
          body: JSON.stringify(createGuestUserRequest)
        });

        return {
          status: response.status,
          success: response.success,
          message: response.message,
          data: response.data || null,
          error: response.error
        };
      }

}
export default ApiService;