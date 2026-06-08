import { HttpClientService } from "../core/http/http-client"
import { ApiResponse } from "./definition"

export const API_PATH = '/api/notifications/save-token'

export interface Request {
  token: string
  userId: string
  signal?: AbortSignal
}

export interface ResponseItem {
  id: string
}

export type SaveResponse = ApiResponse<ResponseItem>

export async function execute(
  http: HttpClientService,
  req: Request
): Promise<SaveResponse> {
  return await http.post<SaveResponse>(API_PATH, req)
}