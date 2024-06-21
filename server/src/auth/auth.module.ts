import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HashService } from './hash/hash.service';
import { UsersModule } from 'src/users/users.module';
import { LocalStrategy } from './strategies/local-strategy';
import { PassportModule } from '@nestjs/passport';
import { Session } from "../entities/session.entity";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as Express from "express";
import * as ExpressSession from "express-session";
import { TypeormStore } from "connect-typeorm";
import { ConfigService } from "@nestjs/config";
import { UserSerializer } from "./serializers/user.serializer";
import * as passport from "passport";

@Module({
  providers: [AuthService, HashService, LocalStrategy, UserSerializer],
  controllers: [AuthController],
  imports: [
    UsersModule,
    PassportModule.register({
      session: true,
    }),
    TypeOrmModule.forFeature([Session])
  ],
})
export class AuthModule implements NestModule{
  private expressSession: Function;

  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private configService: ConfigService) {
    this.configureSession()
  }

  configureSession() {
    this.expressSession = Express().use(
      ExpressSession({
        resave: false,
        saveUninitialized: false,
        store: new TypeormStore({
          cleanupLimit: 20,
          limitSubquery: false,
          ttl: this.configService.get("SESSION_DURATION")
        }).connect(this.sessionRepository),
        secret: this.configService.get("SESSION_SECRET")
      })
    );
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.expressSession, passport.session()).forRoutes("*")
  }

}
