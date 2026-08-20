export interface CurrentUserDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status?: string;
  isEmailVerified: boolean;
}