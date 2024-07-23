import {
  Injectable,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JobApplication } from "../entities/job-application.entity";
import { Repository } from "typeorm";
import { UsersService } from "../users/users.service";
import { Request } from "express";
import { JobPostsService } from "../job-posts/job-posts.service";
import { ApplyForJobException } from "../exceptions/apply-for-job.exception";
import { User } from "../entities/user.entity";
import { unlinkSync } from "fs";
import { StatusEnum } from "../entities/status.entity";
import { Status } from "../entities/status.entity";

@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private jobApplicationsRepository: Repository<JobApplication>,
    private usersService: UsersService,
    @Inject(forwardRef(() => JobPostsService))
    private jobPostsService: JobPostsService
  ) {}

  async applyForJob(
    request: Request,
    postID: number,
    cv: Express.Multer.File | null
  ) {
    const post = await this.jobPostsService.getPostByID(postID);
    if (!post) {
      throw new ApplyForJobException("Post not found");
    }
    if (post.author.id === (request.user as User).id) {
      throw new ApplyForJobException("You can't apply for your own job post");
    }
    if (cv) {
      await this.usersService.updateProfile(request, {}, cv);
      this.deleteOldCV(request.user as User);
    }
    try {
      const jobApplication = new JobApplication();
      jobApplication.jobPost = post;
      jobApplication.user = request.user as User;
      jobApplication.status = <Status>(
        await this.jobPostsService.getStatusIDByName(StatusEnum.PENDING)
      );
      await this.jobApplicationsRepository.save(jobApplication);
      return { message: "Application sent successfully" };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Failed to apply for job");
    }
  }

  async getApplicationsForPost(postID: number, status: string) {
    return await this.jobApplicationsRepository.find({
      relations: ["user", "status"],
      select: {
        user: {
          id: true,
          username: true,
          cv: true,
        },
      },
      where: {
        jobPost: { id: postID },
        status: { status: StatusEnum[status.toUpperCase()] },
      },
    });
  }

  private deleteOldCV(user: User) {
    if (user.cv) {
      unlinkSync(`cv-files/${user.cv}`);
    }
  }
}
