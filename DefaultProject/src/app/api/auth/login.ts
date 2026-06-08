import { HttpClientService } from "../../core/http/http-client"
import { ApiResponse } from "../definition"

export const API_PATH = '/api/v1/user-employees/login'

export interface LoginRequest {
  email: string
  password: string
  signal?: AbortSignal
}

export interface LoginData {
    userId: string
    accessToken: string
    versionNumber?: string;
}

export type LoginResponse = ApiResponse<LoginData>;

export async function login(
  http: HttpClientService,
  req: LoginRequest
): Promise<LoginResponse> {
  return await http.post<LoginResponse>(API_PATH, req)
}