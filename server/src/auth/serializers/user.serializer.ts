import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../../users/users.service';
import { User } from '../../entities/user.entity';
import { SerializedUserDto } from '../dto/serialized-user.dto';

@Injectable()
export class UserSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: Function) {
    const serializedUser = {
      email: user.email,
      roles: user.roles.map((role) => role.role),
    };
    done(null, serializedUser);
  }

  async deserializeUser(user: SerializedUserDto, done: Function) {
    const foundUser = await this.usersService.findByEmail(user.email);
    if (!foundUser) {
      return done(
        `Could not deserialize user: user with ${user.email} could not be found`,
        null,
      );
    }
    done(null, foundUser);
  }
}
