export type SessionUser = {
  id: number;
  name: string;
  email: string | null;
  avatar_url: string | null;
  role: "admin" | "editor" | "user";
};

export type ExchangeResponse = {
  token: string;
  expires_at: string;
  user: SessionUser;
};