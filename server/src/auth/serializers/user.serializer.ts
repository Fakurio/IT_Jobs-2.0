import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../../users/users.service';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: Function) {
    done(null, user.email);
  }

  async deserializeUser(email: string, done: Function) {
    const foundUser = await this.usersService.findByEmail(email);
    if (!foundUser) {
      return done(
        `Could not deserialize user: user with ${email} could not be found`,
        null,
      );
    }
    done(null, foundUser);
  }
}
