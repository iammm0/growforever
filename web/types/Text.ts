export interface TextGenRequest {
  prompt: string;
  max_tokens?: number;
}

export interface TextGenResponse {
  text: string;
}
