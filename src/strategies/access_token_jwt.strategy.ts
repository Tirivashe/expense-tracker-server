/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

type JwtPayload = {
  sub: string,
  email: string
  firstName: string,
  lastName: string
}

@Injectable()
export class AtJwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("ACCESS_TOKEN_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload === null) {
      throw new UnauthorizedException("Cannot get access token");
    }
    return { id: payload.sub, email: payload.email, firstName: payload.firstName, lastName: payload.lastName };
  }
}
