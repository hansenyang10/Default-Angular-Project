import { HttpClientService } from "../core/http/http-client"
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, ListResponse } from "./definition"
import { Role } from "./get-role"

export const API_PATH = '/api/v1/role-employees'

export interface Request {
  signal?: AbortSignal
}

type Entity = Role
export interface Request {
  pageNumber?: number
  pageSize?: number
  select?: (keyof Entity)[]
  search?: string
  signal?: AbortSignal
  status?: string
}

export type ResponseItem = Entity
export type Response = ListResponse<Entity>

export async function execute(
  http: HttpClientService,
  req: Request
): Promise<Response> {

  const params = new URLSearchParams({
    pageNumber: String(req.pageNumber ?? DEFAULT_PAGE_NUMBER),
    pageSize: String(req.pageSize ?? DEFAULT_PAGE_SIZE),
    select: (req.select ?? []).join(','),
    search: req.search ?? '',
    status: req.status ?? 'ALL'
  })

  const url = `${API_PATH}?${params.toString()}`
  return await http.get<Response>(url)
}