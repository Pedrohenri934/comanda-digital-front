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

// Usuario devolvido pela API (nunca inclui senha).
export interface UsuarioApi {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

// Resposta do POST /api/auth/login e do POST /api/auth/register.
export interface LoginResponse {
  token: string;
  usuario: UsuarioApi;
}

// Conteudo (payload) do JWT: "sub" = email, "role" = perfil, "exp" em segundos.
export interface JwtPayload {
  sub: string;
  role: Perfil;
  exp: number;
}
