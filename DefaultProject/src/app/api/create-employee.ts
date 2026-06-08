import { HttpClientService } from "../core/http/http-client"
import { ApiResponse } from "./definition"

export const API_PATH = '/api/v1/user-employees'

export interface Request {
  firstName: string
  middleName: string
  lastName: string
  username: string
  phoneNumber: string
  gender: string
  roles: string[]
  email: string
  password: string
  profileImage?: File | null;
  signal?: AbortSignal
}

export interface ResponseItem {
  userId: string
}

export type CreateResponse = ApiResponse<ResponseItem>;

export async function execute(
  http: HttpClientService,
  req: Request
): Promise<CreateResponse> {
  const formData = new FormData();
  formData.append('FirstName', req.firstName);
  formData.append('MiddleName', req.middleName ?? '');
  formData.append('LastName', req.lastName ?? '');
  formData.append('Username', req.username);
  formData.append('PhoneNumber', req.phoneNumber);
  formData.append('Gender', req.gender);
  formData.append('Email', req.email);
  formData.append('Password', req.password);

  if (req.roles && req.roles.length > 0) {
    req.roles.forEach(role => {
      formData.append('Roles', role);
    });
  }

  if (req.profileImage) {
    formData.append('ProfileImage', req.profileImage, req.profileImage.name);
  }
  return await http.post<CreateResponse>(API_PATH, formData)
}