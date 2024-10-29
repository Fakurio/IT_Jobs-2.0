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
import { WebSocketsService } from "../websockets/websockets.service";

@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private jobApplicationsRepository: Repository<JobApplication>,
    private usersService: UsersService,
    @Inject(forwardRef(() => JobPostsService))
    private jobPostsService: JobPostsService,
    private webSocketsService: WebSocketsService
  ) {}

  async applyForJob(
    request: Request,
    postID: number,
    cv: Express.Multer.File | null
  ) {
    const authenticatedUser = request.user as User;
    const post = await this.jobPostsService.getPostByID(postID);
    if (!post) {
      throw new ApplyForJobException("Post not found");
    }
    if (post.author.id === authenticatedUser.id) {
      throw new ApplyForJobException("You can't apply for your own job post");
    }
    if (cv) {
      await this.usersService.updateProfile(request, {}, cv);
      this.deleteOldCV(authenticatedUser);
    }
    try {
      const jobApplication = new JobApplication();
      jobApplication.jobPost = post;
      jobApplication.user = authenticatedUser;
      jobApplication.status = <Status>(
        await this.jobPostsService.getStatusIDByName(StatusEnum.PENDING)
      );
      await this.jobApplicationsRepository.save(jobApplication);

      await this.webSocketsService.notifyPostAuthor(
        post.author.id,
        post.title,
        authenticatedUser.username
      );
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
      relations: ["jobPost.author", "status", "user"],
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

      await this.webSocketsService.notifyApplicant(
        application.user.id,
        application.jobPost.title
      );
      return { message: "Application status updated successfully" };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Failed to update application status"
      );
    }
  }

  async getAuthenticatedUserApplications(
    user: User,
    statusQueryString: string
  ) {
    const status = <Status>(
      await this.jobPostsService.getStatusIDByName(
        StatusEnum[statusQueryString.toUpperCase()]
      )
    );
    return await this.jobApplicationsRepository
      .createQueryBuilder("jobApplication")
      .innerJoinAndSelect("jobApplication.jobPost", "jobPost")
      .innerJoin("jobPost.author", "author")
      .innerJoinAndSelect("jobPost.languages", "languages")
      .innerJoinAndSelect("jobPost.level", "level")
      .addSelect("author.username")
      .where("jobApplication.user = :user", { user: user.id })
      .andWhere("jobApplication.status = :status", { status: status.id })
      .getMany();
  }

  private deleteOldCV(user: User) {
    if (user.cv) {
      unlinkSync(`cv-files/${user.cv}`);
    }
  }
}
