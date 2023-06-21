/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class RtJwtStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RtJwtStrategy.extractFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get("REFRESH_TOKEN_SECRET"),
    });
  }

  private static extractFromCookie(request: Request): string | null {
    const token: string | null = request.cookies["refresh_token"];
    console.log("Current refresh token: ", { token, ...request.cookies })
    if (!token) throw new UnauthorizedException("Refresh token not found");
    return token;
  }

  async validate(payload: JwtPayload) {
    if (payload === null) {
      throw new UnauthorizedException("Cannot validate user");
    }
    return { id: payload.sub, email: payload.email };
  }
}
