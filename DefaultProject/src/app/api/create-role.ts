import { HttpClientService } from "../core/http/http-client"
import { ApiResponse } from "./definition"

export const API_PATH = '/api/v1/role-employees'

export interface Request {
  roleName?: string
  status?: string
  signal?: AbortSignal
}

export interface ResponseItem {
  id: string
}

export type CreateResponse = ApiResponse<ResponseItem>;

export async function execute(
  http: HttpClientService,
  req: Request
): Promise<CreateResponse> {

  return await http.post<CreateResponse>(API_PATH, req)
}