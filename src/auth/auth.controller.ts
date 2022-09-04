/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Body, Res, HttpCode, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthCredentialDto } from "./dto/auth-credentials.dto";
import { HttpStatus } from "@nestjs/common/enums";
import { User } from "../decorators/get-user.decorator";
import { AtJwtGuard } from "../guards/access_token.guards";
import { RtJwtGuard } from "../guards/refresh_token.guard";
import { Req } from "@nestjs/common/decorators";
import { ResetPasswordDto } from "./dto/reset-user-password.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() authCredentials: AuthCredentialDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ access_token: string }> {
    return this.authService.register(authCredentials, response);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() authCredentials: AuthCredentialDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ access_token: string }> {
    return this.authService.login(authCredentials, response);
  }

  @Get("refresh")
  @HttpCode(HttpStatus.OK)
  @UseGuards(RtJwtGuard)
  async refresh(
    @User("id") id: string,
    @Req() request: Request
  ): Promise<{ access_token: string }> {
    return this.authService.refresh(id, request);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtJwtGuard)
  async logout(
    @User("id") id: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    return this.authService.logout(id, response);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtJwtGuard)
  resetPassword(
    @Body() resetPassword: ResetPasswordDto,
    @User("id") id: string
  ) {
    return this.authService.resetPassword(resetPassword, id);
  }
}
