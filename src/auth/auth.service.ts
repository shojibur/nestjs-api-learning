import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import * as argon from "argon2";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("User already exists");
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    //if user does not exist throw exception
    if (!user) {
      throw new ForbiddenException("Invalid credentials");
    }
    //if user exists check password
    const pwMatches = await argon.verify(user.hash, dto.password);
    //if password is wrong throw exception
    if (!pwMatches) {
      throw new ForbiddenException("Invalid credentials");
    }
    //if password is correct return user
    delete user.hash;
    return user;
  }
}
