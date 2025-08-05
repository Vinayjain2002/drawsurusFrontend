const API_BASE_URL= process.env.API_URL || "http://localhost:5000"

export interface ApiResponse<T = any>{
    success: boolean,
    data?: T,
    message?: string,
    error?: string
}

export interface LoginRequest{
    email: string,
    password: string
}

export interface SignUpRequest{
    username: string,
    email: string,
    password: string,
    enterpriseTag: string
}

export interface User{
    id: string,
    userName: string,
    email: string,
    avatar?: string,
    createdAt: string,
    isAdmin: boolean,
    lastOnline?: Date,
    isOnline?: boolean,
    enterpriseTag?: string,
    totalGamePlayed?: number,
    totalWins?: number
}

export interface AuthResponse{
    user: User,
    token: string,
    refreshToken?: string
}

class ApiService{
    private baseURL: string
    private token: string | null = null

    constructor(baseURL: string){
        this.baseURL= baseURL
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

    clearToken(token: string){
        this.token= null;
        if(typeof window !== 'undefined'){
            localStorage.removeItem("auth_token");
        }
    }

    private getHeaders(): HeadersInit {
        // a private method for the initializing of the headers
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
        const url= `{this.BaseURL}${endpoint}`
        const config: RequestInit = {
            headers: this.getHeaders(),
            ...options
        }
        try{
            const response= await fetch(url, config);
            const data= await response.json();
            if(!response.ok){
                throw new Error(data.message || `HTTP error! status: ${response.status}`)
            }
            return data;
        }
        catch(err){
            console.log("Api request failed: ", err);
            throw err;
        }
    }

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        })
    
        if (response.success && response.data) {
          this.setToken(response.data.token)
          return response.data
        }
    
        throw new Error(response.message || 'Login failed')
      }

      async signup(userData: SignUpRequest): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/auth/signup', {
          method: 'POST',
          body: JSON.stringify(userData),
        })
    
        if (response.success && response.data) {
          this.setToken(response.data.token)
          return response.data
        }
    
        throw new Error(response.message || 'Signup failed')
      }

      async logout(): Promise<void> {
        try {
          await this.request('/auth/logout', {
            method: 'POST',
          })
        } catch (error) {
          console.error('Logout request failed:', error)
        } finally {
        //   this.clearToken()
        }
      }

      async refreshToken(): Promise<AuthResponse>{
        const response= await this.request<AuthResponse>("/auth/refresh", {
            method: 'POST'
        });

        if(response.success && response.data){
            this.setToken(response.data.token);
            return response.data;
        }
        throw new Error(response.message || "Token refresh Failed");
      }

      async getCurrentUser(): Promise<User> {
        const response = await this.request<User>('/auth/profile',{
            method: 'GET'
        });
        
        if (response.success && response.data) {
          return response.data;
        }
    
        throw new Error(response.message || 'Failed to get user data')
      }

      async updateProfile():  Promise<User> {
        const response= await this.request<User>("/auth/profile", {
            method: 'POST'
        });
        if(response.success && response.data){
            return response.data;
        }
        throw new Error(response.message || 'Failed to update user data')
      }

      

      // Auth routes end here
}