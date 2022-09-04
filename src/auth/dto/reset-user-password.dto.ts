import { IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
