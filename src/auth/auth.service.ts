import {
  Injectable,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { AuthCredentialDto } from "./dto/auth-credentials.dto";
import { JwtService } from "@nestjs/jwt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { compare, hash } from "bcrypt";
import { ConfigService } from "@nestjs/config";

type Tokens = {
  access_token: string;
  refresh_token: string;
};
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(
    { email, password }: AuthCredentialDto,
    response: Response
  ): Promise<{ access_token: string }> {
    try {
      const alreadyExistingUser = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });

      if (alreadyExistingUser)
        throw new ForbiddenException("This email already exists");

      const hashedPassword = await this.hashUserPassword(password);

      const newUser = await this.prismaService.user.create({
        data: {
          firstName: "User",
          lastName: "One",
          email,
          password: hashedPassword,
        },
      });

      const { access_token, refresh_token } = await this.createTokens(
        newUser.id,
        email
      );

      await this.updateRefreshToken(newUser.id, refresh_token);

      response.cookie("refresh_token", refresh_token, { httpOnly: true });

      return { access_token };
    } catch (err) {
      if (PrismaClientKnownRequestError)
        throw new HttpException(err.response, err.status);
      else throw new InternalServerErrorException(err.message);
    }
  }

  async login(
    { email, password }: AuthCredentialDto,
    response: Response
  ): Promise<{ access_token: string }> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) throw new ForbiddenException("Invalid credentials");

      const isValidPassword = await this.verifyPassword(
        password,
        user.password
      );
      if (!isValidPassword) throw new ForbiddenException("Invalid credentials");

      const { access_token, refresh_token } = await this.createTokens(
        user.id,
        email
      );

      await this.updateRefreshToken(user.id, refresh_token);

      response.cookie("refresh_token", refresh_token, { httpOnly: true });
      return {
        access_token,
      };
    } catch (err) {
      if (PrismaClientKnownRequestError)
        throw new HttpException(err.response, err.status);
      else throw new InternalServerErrorException(err.message);
    }
  }

  async refresh(
    id: string,
    request: Request
  ): Promise<{ access_token: string }> {
    try {
      const refresh_token: string = request.cookies["refresh_token"];

      if (!refresh_token)
        throw new ForbiddenException(
          "User unauthorized. Refresh token missing"
        );

      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) throw new ForbiddenException("User not found");

      const isRefreshTokenVerified = refresh_token === user.refresh_token;

      if (!isRefreshTokenVerified)
        throw new ForbiddenException("User unauthorized");

      const { access_token } = await this.createTokens(user.id, user.email);

      return { access_token };
    } catch (err) {
      if (PrismaClientKnownRequestError)
        throw new HttpException(err.response, err.status);
      else throw new InternalServerErrorException(err.message);
    }
  }

  async logout(id: string, response: Response) {
    response.clearCookie("refresh_token");
    try {
      await this.prismaService.user.updateMany({
        where: {
          id,
          refresh_token: {
            not: null,
          },
        },
        data: {
          refresh_token: null,
        },
      });
    } catch (err) {
      if (PrismaClientKnownRequestError)
        throw new HttpException(err.response, err.status);
      else throw new InternalServerErrorException(err.message);
    }
  }

  private async hashUserPassword(password: string): Promise<string> {
    const HASH_SALT = 10;
    return hash(password, HASH_SALT);
  }

  private async verifyPassword(password: string, userPassword: string) {
    return compare(password, userPassword);
  }

  private async createTokens(id: string, email: string): Promise<Tokens> {
    const payload = { sub: id, email };

    const accessToken = this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
      expiresIn: "2m",
    });

    const refreshToken = this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
      expiresIn: "10m",
    });

    const [access_token, refresh_token] = await Promise.all([
      accessToken,
      refreshToken,
    ]);

    return { access_token, refresh_token };
  }

  private async updateRefreshToken(
    userId: string,
    refresh_token: string
  ): Promise<void> {
    await this.prismaService.user.updateMany({
      where: {
        id: userId,
      },
      data: {
        refresh_token,
      },
    });
  }
}
