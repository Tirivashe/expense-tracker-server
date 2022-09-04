import { Category } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["PRODUCTS", "ENTERTAINMENT", "BILLS", "OTHER"])
  category: Category;

  @IsNumber()
  @IsNotEmpty()
  expense: number;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;
}
