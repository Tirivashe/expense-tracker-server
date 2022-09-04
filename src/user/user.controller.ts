import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
} from "@nestjs/common";
import { HttpStatus } from "@nestjs/common/enums";
import { AtJwtGuard } from "../guards/access_token.guards";
import { User } from "../decorators/get-user.decorator";
import { EditProfileDto } from "./dto/edit-profile.dto";
import { UserService } from "./user.service";

@UseGuards(AtJwtGuard)
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("edit-profile")
  @HttpCode(HttpStatus.OK)
  async editProfile(
    @Body() editProfileDto: EditProfileDto,
    @User("id") id: string
  ) {
    return this.userService.editProfile(editProfileDto, id);
  }
}
