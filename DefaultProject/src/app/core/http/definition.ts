export interface ValidationError {
  errorCode: string;
  errorMessage: string;
  propertyName: string;
}

export interface ErrorResponse {
  message: string;
  errors: ValidationError[];
}