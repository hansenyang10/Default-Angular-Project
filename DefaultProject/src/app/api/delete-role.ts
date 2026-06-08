import { HttpClientService } from "../core/http/http-client"
import { ApiResponse } from "./definition"

export const API_PATH = '/api/v1/role-employees/:id'

export interface Request {
  id: string
  versionNumber?: string
  signal?: AbortSignal
}

export interface ResponseItem {
  id: string
}

export type DeleteResponse = ApiResponse<ResponseItem>;

export async function execute(
  http: HttpClientService,
  req: Request
): Promise<DeleteResponse> {
  const url = `${API_PATH.replace(/:id/g, req.id)}`;
  return await http.delete<DeleteResponse>(url, req)
}