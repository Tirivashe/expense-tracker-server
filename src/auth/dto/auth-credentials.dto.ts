import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class AuthCredentialDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
}
