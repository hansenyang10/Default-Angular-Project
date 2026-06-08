import { HttpClientService } from "../core/http/http-client"
import { ApiResponse, PatchRequest, PatchResponse, PatchValue } from "./definition";

export const API_PATH = '/api/v1/role-employees/:id'

export type Request = {
  roleName: string;
  status: string;
  [key: string]: PatchValue;
}

export type UpdateResponse = ApiResponse<PatchResponse>

export async function execute(
  http: HttpClientService,
  req: PatchRequest<Request>,
): Promise<UpdateResponse> {
  const url = `${API_PATH.replace(/:id/g, req.id)}`;
  const body = {
    operations: req.operations,
  };
  return await http.patch<UpdateResponse>(url, body, req.versionNumber)
}