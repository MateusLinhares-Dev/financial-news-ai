export interface JWTPayload {
  userId: number;
  email: string;
}

export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}
