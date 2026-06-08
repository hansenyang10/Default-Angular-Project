import { HttpClientService } from "../core/http/http-client"
import { ApiResponse, PatchRequest, PatchResponse, PatchValue } from "./definition";

export const API_PATH = '/api/v1/user-employees/:userId'

export type PasswordRequest = {
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export type Request = {
  firstName: string;
  middleName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  gender: string;
  email: string;
  [key: string]: PatchValue;
}

export type UpdateResponse = ApiResponse<PatchResponse>

export async function execute(
  http: HttpClientService,
  req: PatchRequest<Request>,
  roles: string[],
  passwordRequest: PasswordRequest,
  profileImage?: File | null
): Promise<UpdateResponse> {
  const url = `${API_PATH.replace(/:userId/g, req.id)}`;

  const formData = new FormData();
  if (roles && roles.length > 0) {
    roles.forEach(role => formData.append('Roles', role));
  }

  if (req.operations && req.operations.length > 0) {
    formData.append('Operations', JSON.stringify(req.operations));
  }

  formData.append('OldPassword', passwordRequest.oldPassword ?? '');
  formData.append('NewPassword', passwordRequest.newPassword ?? '');
  formData.append('ConfirmNewPassword', passwordRequest.confirmNewPassword ?? '');

  if (profileImage) {
    formData.append('ProfileImage', profileImage, profileImage.name);
  }

  return await http.patch<UpdateResponse>(url, formData, req.versionNumber)
}