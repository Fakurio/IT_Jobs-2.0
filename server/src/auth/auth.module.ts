import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { HashService } from "./hash/hash.service";
import { UsersModule } from "../users/users.module";
import { LocalStrategy } from "./strategies/local-strategy";
import { PassportModule } from "@nestjs/passport";
import { Session } from "../entities/session.entity";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as Express from "express";
import * as ExpressSession from "express-session";
import { TypeormStore } from "connect-typeorm";
import { ConfigService } from "@nestjs/config";
import { UserSerializer } from "./serializers/user.serializer";
import * as passport from "passport";
import { NotificationsModule } from "src/notifications/notifications.module";

@Module({
  providers: [AuthService, HashService, LocalStrategy, UserSerializer],
  controllers: [AuthController],
  imports: [
    forwardRef(() => UsersModule),
    PassportModule.register({
      session: true,
    }),
    TypeOrmModule.forFeature([Session]),
    forwardRef(() => NotificationsModule),
  ],
  exports: [HashService],
})
export class AuthModule implements NestModule {
  private expressSession: any;

  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private configService: ConfigService
  ) {
    this.configureSession();
  }

  configureSession() {
    this.expressSession = Express().use(
      ExpressSession({
        resave: false,
        saveUninitialized: false,
        cookie: {
          sameSite: "lax",
        },
        store: new TypeormStore({
          cleanupLimit: 20,
          limitSubquery: false,
          ttl: parseInt(this.configService.get("SESSION_DURATION") || "3600"),
        }).connect(this.sessionRepository),
        secret: this.configService.get("SESSION_SECRET") || "",
      })
    );
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.expressSession, passport.session()).forRoutes("*");
  }
}
