/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from "class-validator";
export class EditProfileDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
