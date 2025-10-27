// Auth Types - Matching Backend DTOs

export interface RegisterRequestDto {
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  bio?: string;
  icone?: string;
  profissao?: string;
  comoConheceu?: string;
}

export interface LoginRequestDto {
  email: string;
  senha: string;
}

export interface AuthResponseDto {
  userId: string;
  nome: string;
  sobrenome: string;
  email: string;
  bio: string | null;
  icone: string | null;
  profissao: string | null;
  comoConheceu: string | null;
  isMaster: boolean;
  token: string;
  expiresAt: string;
}

export interface User {
  userId: string;
  nome: string;
  sobrenome: string;
  email: string;
  bio: string | null;
  icone: string | null;
  profissao: string | null;
  comoConheceu: string | null;
  isMaster: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UpdateProfileRequestDto {
  nome: string;
  sobrenome: string;
  bio?: string;
  icone?: string;
}

export interface UpdatePasswordRequestDto {
  senhaAtual: string;
  novaSenha: string;
}

export interface UserProfileDto {
  userId: string;
  nome: string;
  sobrenome: string;
  email: string;
  bio: string | null;
  icone: string | null;
  profissao: string | null;
  comoConheceu: string | null;
  isMaster: boolean;
  criadoEm: string;
}
