import { HttpClientService } from "../core/http/http-client"
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, ListResponse } from "./definition"
import { Employee } from "./get-employee"

export const API_PATH = '/api/v1/user-employees'

export interface Request {
  signal?: AbortSignal
}

type Entity = Employee
export interface Request {
  pageNumber?: number
  pageSize?: number
  select?: (keyof Entity)[]
  search?: string
  roles?: string[]
  gender?: string
  signal?: AbortSignal
}

export type ResponseItem = Entity
export type Response = ListResponse<Entity>

export async function execute(
  http: HttpClientService,
  req: Request
): Promise<Response> {

  const params = new URLSearchParams();

  params.append('pageNumber', String(req.pageNumber ?? DEFAULT_PAGE_NUMBER));
  params.append('pageSize', String(req.pageSize ?? DEFAULT_PAGE_SIZE));
  params.append('select', (req.select ?? []).join(','));
  params.append('search', req.search ?? '');
  params.append('gender', req.gender ?? '');

  (req.roles ?? []).forEach(role => {
    params.append('roles', role); 
  });

  const url = `${API_PATH}?${params.toString()}`
  return await http.get<Response>(url)
}