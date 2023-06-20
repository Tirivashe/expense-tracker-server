import { Injectable } from "@nestjs/common";
import {
  HttpException,
  InternalServerErrorException,
  ForbiddenException,
} from "@nestjs/common/exceptions";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/errors";
import { PrismaService } from "../prisma/prisma.service";
import { EditProfileDto } from "./dto/edit-profile.dto";

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async editProfile({ firstName, lastName }: EditProfileDto, id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) throw new ForbiddenException("Unauthorized");

      return await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          firstName,
          lastName,
        },
        select: {
          firstName: true,
          lastName: true,
        },
      });
    } catch (err) {
      if (PrismaClientKnownRequestError)
        throw new HttpException(err.response, err.status);
      else throw new InternalServerErrorException(err.message);
    }
  }
}
