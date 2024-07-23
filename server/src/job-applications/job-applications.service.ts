import {
  Injectable,
  InternalServerErrorException,
  Inject,
  forwardRef,
  BadRequestException,
  NotFoundException,
  StreamableFile,
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
import { createReadStream } from "fs";
import { join } from "path";
import { UpdateApplicationStatusDTO } from "./dto/update-application-status.dto";

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

  async getCVFromApplication(user: User, applicationID: number) {
    const application = await this.jobApplicationsRepository.findOne({
      relations: ["user", "jobPost", "jobPost.author"],
      where: { id: applicationID },
    });
    if (!application) {
      throw new BadRequestException("Application not found");
    }
    if (application.jobPost.author.id !== user.id) {
      throw new BadRequestException("You are not authorized to view this CV");
    }
    if (!application.user.cv) {
      throw new NotFoundException("Applicant has removed their CV");
    }
    const cv = createReadStream(
      join(process.cwd(), `cv-files/${application.user.cv}`)
    );
    return new StreamableFile(cv);
  }

  async updateApplicationStatus(
    user: User,
    applicationID: number,
    updateApplicationStatusDTO: UpdateApplicationStatusDTO
  ) {
    const application = await this.jobApplicationsRepository.findOne({
      relations: ["jobPost.author", "status"],
      where: { id: applicationID },
    });
    if (!application) {
      throw new BadRequestException("Application not found");
    }
    if (application.jobPost.author.id !== user.id) {
      throw new BadRequestException(
        "You are not authorized to update this application"
      );
    }
    if (application.status.status !== StatusEnum.PENDING) {
      throw new BadRequestException("You can only update pending applications");
    }
    try {
      const status = <Status>(
        await this.jobPostsService.getStatusIDByName(
          updateApplicationStatusDTO.status
        )
      );
      application.status = status;
      await this.jobApplicationsRepository.save(application);
      return { message: "Application status updated successfully" };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Failed to update application status"
      );
    }
  }

  private deleteOldCV(user: User) {
    if (user.cv) {
      unlinkSync(`cv-files/${user.cv}`);
    }
  }
}
