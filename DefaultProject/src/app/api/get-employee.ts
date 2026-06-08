import { HttpClientService } from '../core/http/http-client'
import type { EntityStatus } from './definition'

export const API_PATH = '/api/v1/user-employees/:userId'

export interface Employee {
  id: string
  versionNumber?: string
  firstName?: string
  middleName?: string
  lastName?: string
  fullName?: string
  roles?: string[]
  gender?: string
  email?: string
  phoneNumber?:string
  userName?:string
  oldPassword?: string
  newPassword?: string
  confirmNewPassword?: string
  status?: EntityStatus
  profilePictureUrl?: string
}

export interface Request {
  id: string
  select?: (keyof Employee)[]
  signal?: AbortSignal
}

export type Response = Employee


export async function execute(
  http: HttpClientService,
  req: Request
): Promise<Response> {

  const params = new URLSearchParams({
    select: (req.select ?? []).join(','),
  })
  const url = `${API_PATH.replace(/:userId/g, req.id)}?${params.toString()}`
  return await http.get<Response>(url)
}