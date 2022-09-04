/* eslint-disable prettier/prettier */
import { Category } from "@prisma/client";

export class FilterDto {
  timeSpan: string;
  category: Category | "all"
  sortBy: string;
  order: string;
}
