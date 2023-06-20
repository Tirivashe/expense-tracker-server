import { Injectable } from "@nestjs/common";
import {
  HttpException,
  InternalServerErrorException,
} from "@nestjs/common/exceptions";
import { Category, Transaction, PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { subMonths, subDays, sub } from "date-fns";
import { DeletingTransactionsDto } from "./dto/transactions-to-delete.dto";
import { FilterDto } from "./dto/transactionFilter.dto";
@Injectable()
export class TransactionsService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(
    { name, category, createdAt, expense }: CreateTransactionDto,
    userId: string
  ) {
    try {
      const transaction = await this.prismaService.transaction.create({
        data: {
          name,
          expense,
          category,
          createdAt,
          userId,
        },
        select: {
          id: true,
          category: true,
          createdAt: true,
          expense: true,
          name: true,
        },
      });

      return { transaction };
    } catch (err) {
      if (PrismaClient.PrismaClient.PrismaClientKnownRequestError)
        throw new HttpException(err.response, err.status);
      else throw new InternalServerErrorException(err.message);
    }
  }

  async getAllTransactions(id: string) {
    try {
      return await this.prismaService.transaction.findMany({
        where: {
          userId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          category: true,
          createdAt: true,
          expense: true,
          name: true,
        },
      });
    } catch (err) {
      if (PrismaClient.PrismaClientKnownRequestError)
        throw new HttpException(err.response, err.status);
      else throw new InternalServerErrorException(err.message);
    }
  }

  async getTransactionsWithFilter(
    id: string,
    {
      timeSpan,
      order,
      category,
      sortBy,
    }: {
      timeSpan?: string;
      order?: string;
      category?: Category | "ALL";
      sortBy?: string;
    }
  ) {
    try {
      if (category !== "ALL") {
        return await this.prismaService.transaction.findMany({
          where: {
            userId: id,
            createdAt: {
              gte: subDays(new Date(), +timeSpan + 1),
            },
            category,
          },
          orderBy: {
            [sortBy]: order,
          },
          select: {
            id: true,
            category: true,
            createdAt: true,
            expense: true,
            name: true,
          },
        });
      }
      return await this.prismaService.transaction.findMany({
        where: {
          userId: id,
          createdAt: {
            gte: subDays(new Date(), +timeSpan + 1),
          },
        },
        orderBy: {
          [sortBy]: order,
        },
        select: {
          id: true,
          category: true,
          createdAt: true,
          expense: true,
          name: true,
        },
      });
    } catch (err) {
      if (PrismaClient.PrismaClientKnownRequestError)
        throw new HttpException(err.response, err.status);
      else throw new InternalServerErrorException(err.message);
    }
  }

  async getCategoryCostTotal(id: string) {
    try {
      return await this.prismaService.transaction.groupBy({
        by: ["category"],
        where: {
          userId: id,
          createdAt: {
            lte: new Date(),
            gte: subMonths(new Date(), 1),
          },
        },
        _sum: {
          expense: true,
        },
      });
    } catch (err) {
      if (PrismaClient.PrismaClientKnownRequestError)
        throw new HttpException(err.response, err.status);
      else throw new InternalServerErrorException(err.message);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.prismaService.transaction.deleteMany({
        where: {
          id,
        },
      });
      return { message: "Transaction deleted" };
    } catch (err) {
      if (PrismaClient.PrismaClientKnownRequestError)
        throw new HttpException(err.response, err.status);
      else throw new InternalServerErrorException(err.message);
    }
  }

  async getTransactionsToDelete(
    { from, to }: DeletingTransactionsDto,
    id: string
  ) {
    try {
      return await this.prismaService.transaction.findMany({
        where: {
          userId: id,
          createdAt: {
            lte: to,
            gte: from,
          },
        },
        select: {
          id: true,
          category: true,
          createdAt: true,
          expense: true,
          name: true,
        },
      });
    } catch (err) {
      if (PrismaClient.PrismaClientKnownRequestError)
        throw new HttpException(err.response, err.status);
      else throw new InternalServerErrorException(err.message);
    }
  }
}
