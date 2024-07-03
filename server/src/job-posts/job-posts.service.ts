import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { In, Repository } from "typeorm";
import { JobPost } from "../entities/job-post.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Status, StatusEnum } from "../entities/status.entity";
import { AddPostDTO } from "./dto/add-post.dto";
import { ContractType } from "../entities/contract-type.entity";
import { Level } from "../entities/level.entity";
import { User } from "../entities/user.entity";
import { Language } from "../entities/language.entity";

@Injectable()
export class JobPostsService {
  constructor(
    @InjectRepository(JobPost)
    private jobPostsRepository: Repository<JobPost>,
    @InjectRepository(ContractType)
    private contractTypesRepository: Repository<ContractType>,
    @InjectRepository(Level)
    private levelsRepository: Repository<Level>,
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
    @InjectRepository(Language)
    private languagesRepository: Repository<Language>,
  ) {}

  async getAll(): Promise<JobPost[]> {
    return await this.jobPostsRepository
      .createQueryBuilder("jobPost")
      .innerJoin("jobPost.level", "level")
      .innerJoin("jobPost.contractType", "contractType")
      .innerJoin("jobPost.author", "author")
      .innerJoin("jobPost.languages", "languages")
      .innerJoin("jobPost.status", "status")
      .select([
        "jobPost",
        "level",
        "contractType",
        "languages",
        "author.id",
        "author.username",
      ])
      .where("status.status = :status", { status: StatusEnum.ACCEPTED })
      .getMany();
  }

  async addPost(
    authenticatedUser: User,
    addPostDto: AddPostDTO,
    logo: Express.Multer.File,
  ) {
    try {
      const jobPost = new JobPost();
      jobPost.companyName = addPostDto.companyName;
      jobPost.title = addPostDto.title;
      jobPost.salary = addPostDto.salary;
      jobPost.logo = logo.filename;
      jobPost.description = addPostDto.description;
      jobPost.location = addPostDto.location;
      jobPost.contractType = <ContractType>(
        await this.contractTypesRepository.findOneBy({
          type: addPostDto.contractType,
        })
      );
      jobPost.level = <Level>await this.levelsRepository.findOneBy({
        level: addPostDto.level,
      });
      jobPost.author = authenticatedUser;
      jobPost.status = <Status>await this.statusRepository.findOneBy({
        status: StatusEnum.PENDING,
      });
      jobPost.languages = await this.languagesRepository.findBy({
        language: In(addPostDto.languages),
      });
      await this.jobPostsRepository.save(jobPost);
      return {
        message: `JobPost added successfully`,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Adding job post failed");
    }
  }
}
