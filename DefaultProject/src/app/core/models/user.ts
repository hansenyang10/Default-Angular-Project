export interface WhoAmIResponse {
  userId: string
  roles: string[]
  profile: {
    firstName: string
    middleName: string | null
    lastName: string | null
    fullName: string
    email: string
    phoneNumber:string
  }
}