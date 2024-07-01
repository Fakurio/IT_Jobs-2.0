import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { UsersService } from "../src/users/users.service";
import { RoleTypes } from "../src/entities/role.entity";
import { HashService } from "../src/auth/hash/hash.service";

const USERNAME = "Mod";
const EMAIL = "mod@moderator.pl";
const PASSWORD = "123456";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const usersService = app.get(UsersService);
  const hashService = app.get(HashService);
  const dto = {
    username: USERNAME,
    email: EMAIL,
    password: await hashService.hashPassword(PASSWORD),
  };
  try {
    await usersService.addUser(dto, RoleTypes.MODERATOR);
  } catch (error) {
    console.log(error);
  } finally {
    console.log("Moderator added successfully");
    await app.close();
  }
}

bootstrap();
