// Perfis definidos no SRS (RF-040). Precisam ser IGUAIS ao enum Perfil do back.
export type Perfil = 'ADMIN' | 'GERENTE' | 'COZINHEIRO' | 'CLIENTE';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  endereco: string;
}

// Resposta do POST /api/auth/login. CONFIRMAR com o back se o campo se chama "token".
export interface LoginResponse {
  token: string;
}

// Conteúdo (payload) do JWT. "role" é o que o SRS pede (RF-038); "sub" costuma ser o email; "exp" é em segundos.
export interface JwtPayload {
  sub: string;
  role: Perfil;
  exp: number;
}
