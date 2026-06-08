export type EntityStatus = 'ACTIVE' | 'INACTIVE'

export interface ListResponse<T> {
  pageNumber: number
  pageSize: number
  data: T[]
  next: boolean
}

export const DEFAULT_PAGE_NUMBER = 1
export const DEFAULT_PAGE_SIZE = 25

export const TOKEN_KEY = 'auth_token'
export const FCM_KEY = 'fcm_token'

export type PatchPath = string
export type PatchValue = string | boolean | number | undefined | null 

export interface PatchOperation<
  TPath extends PatchPath = PatchPath,
  TValue extends PatchValue = PatchValue,
> {
  op: 'replace'
  path: TPath
  value: TValue
}

export type EntityPatchOperation<T extends Record<PatchPath, PatchValue>> = PatchOperation<
  Extract<keyof T, string>,
  T[keyof T]
>

export type PatchRequest<T extends Record<PatchPath, PatchValue>> = {
  id: string
  versionNumber: string
  operations: EntityPatchOperation<T>[]
  signal?: AbortSignal
}

export type PatchResponse = {
  id: string
  versionNumber: string
}

export interface ApiResponse<T> {
  succeeded: boolean;
  data: T;
  error: string | null | any;
}