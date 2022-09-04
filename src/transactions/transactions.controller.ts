import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { ParseFloatPipe, ParseIntPipe } from "@nestjs/common/pipes";
import { AtJwtGuard } from "../guards/access_token.guards";
import { User } from "../decorators/get-user.decorator";
import { Category, Transaction } from "@prisma/client";
import { DeletingTransactionsDto } from "./dto/transactions-to-delete.dto";
import { FilterDto } from "./dto/transactionFilter.dto";

@UseGuards(AtJwtGuard)
@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
  @Get()
  async getTransactions(
    @User("id") id: string,
    @Query("timeSpan") timeSpan?: string,
    @Query("order") order?: string,
    @Query("sortBy") sortBy?: string,
    @Query("category") category?: Category | "ALL"
  ) {
    const transactionFilter = { timeSpan, order, sortBy, category };
    if (
      Object.values(transactionFilter).every((value) => value !== undefined)
    ) {
      return this.transactionsService.getTransactionsWithFilter(
        id,
        transactionFilter
      );
    } else {
      return this.transactionsService.getAllTransactions(id);
    }
  }

  @Get("category-sum")
  async getCategoryCostTotal(@User("id") id: string) {
    return this.transactionsService.getCategoryCostTotal(id);
  }
  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @User("id") id: string
  ) {
    return this.transactionsService.create(createTransactionDto, id);
  }

  @Post("/delete-transactions")
  async getTransactionsToDelete(
    @Body() deletingTransactions: DeletingTransactionsDto,
    @User("id") id: string
  ) {
    return this.transactionsService.getTransactionsToDelete(
      deletingTransactions,
      id
    );
  }
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<{
    message: string;
  }> {
    return this.transactionsService.remove(id);
  }
}
