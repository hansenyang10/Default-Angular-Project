import { HttpClientService } from '../core/http/http-client'
import type { EntityStatus } from './definition'

export const API_PATH = '/api/v1/role-employees/:id'

export interface Role {
  id: string
  versionNumber?: string
  roleName?: string
  status?: EntityStatus
}

export interface Request {
  id: string
  select?: (keyof Role)[]
  signal?: AbortSignal
}

export type Response = Role


export async function execute(
  http: HttpClientService,
  req: Request
): Promise<Response> {

  const params = new URLSearchParams({
    select: (req.select ?? []).join(','),
  })
  const url = `${API_PATH.replace(/:id/g, req.id)}?${params.toString()}`
  return await http.get<Response>(url)
}