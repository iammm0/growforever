export interface LoginRequest {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
