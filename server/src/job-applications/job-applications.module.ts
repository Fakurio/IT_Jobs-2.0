import { Module, forwardRef } from "@nestjs/common";
import { JobApplicationsService } from "./job-applications.service";
import { JobApplicationsController } from "./job-applications.controller";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JobApplication } from "../entities/job-application.entity";
import { UsersModule } from "../users/users.module";
import { JobPostsModule } from "../job-posts/job-posts.module";
import { WebSocketsModule } from "src/websockets/websockets.module";

@Module({
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([JobApplication]),
    UsersModule,
    forwardRef(() => JobPostsModule),
    WebSocketsModule,
  ],
  exports: [JobApplicationsService],
})
export class JobApplicationsModule {}
