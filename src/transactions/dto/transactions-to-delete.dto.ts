/* eslint-disable prettier/prettier */
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty } from "class-validator";

export class DeletingTransactionsDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  from: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  to: Date;
}
