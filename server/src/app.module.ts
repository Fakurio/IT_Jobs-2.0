import { Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { dataSourceOptions } from "./database/data-source";
import { UsersModule } from "./users/users.module";
import { JobPostsModule } from "./job-posts/job-posts.module";
import { JobApplicationsModule } from './job-applications/job-applications.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions as TypeOrmModuleOptions),
    AuthModule,
    UsersModule,
    JobPostsModule,
    JobApplicationsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
