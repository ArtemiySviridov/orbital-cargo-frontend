export interface IUser {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

export interface IAuthState {
  user: IUser | null;
  accessToken: string | null;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}
