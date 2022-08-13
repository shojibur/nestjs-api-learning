import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  signup() {
    return { msg: 'hello' };
  }

  signin() {
    return 'signin';
  }
}
