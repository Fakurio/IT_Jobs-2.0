import { Module, forwardRef } from "@nestjs/common";
import { JobPostsController } from "./job-posts.controller";
import { JobPostsService } from "./job-posts.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JobPost } from "../entities/job-post.entity";
import { ContractType } from "../entities/contract-type.entity";
import { Level } from "../entities/level.entity";
import { Language } from "../entities/language.entity";
import { Status } from "../entities/status.entity";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "src/users/users.module";
import { JobApplicationsModule } from "src/job-applications/job-applications.module";
import { WebSocketsModule } from "src/websockets/websockets.module";

@Module({
  controllers: [JobPostsController],
  providers: [JobPostsService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([JobPost, ContractType, Level, Status, Language]),
    UsersModule,
    forwardRef(() => JobApplicationsModule),
    WebSocketsModule,
  ],
  exports: [JobPostsService],
})
export class JobPostsModule {}
