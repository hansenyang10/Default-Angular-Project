import { WhoAmIResponse } from '../core/models/user'
import { HttpClientService } from '../core/http/http-client'

export const API_PATH = '/api/v1/whoami'

export interface Request {
  signal?: AbortSignal
}

export interface Response extends WhoAmIResponse{}

export async function execute(
  http: HttpClientService,
): Promise<Response> {
  return await http.get<Response>(API_PATH)
}