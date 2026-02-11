// Tipos relacionados à autenticação

export interface LoginDTO {
  login: string; // String criptografada: encrypt(email + "}*{" + password, publicKey)
}

export interface TokenDTO {
  token: string;
  refreshToken: string;
}

export interface SecurityDTO {
  id: number;
  publicKey: string;
  screen: string;
  userId: number | null;
}

export interface UserDTO {
  id?: string;
  name: string;
  email: string;
  password?: string;
  sobrenome?: string;
  passwordHash?: string;
  administrador?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
