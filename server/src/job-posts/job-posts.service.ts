import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { And, In, Repository } from "typeorm";
import { JobPost } from "../entities/job-post.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Status, StatusEnum } from "../entities/status.entity";
import { AddPostDTO } from "./dto/add-post.dto";
import { ContractType } from "../entities/contract-type.entity";
import { Level } from "../entities/level.entity";
import { User } from "../entities/user.entity";
import { Language } from "../entities/language.entity";
import { UpdatePostStatusDTO } from "./dto/update-post-status.dto";
import { UpdatePostDTO } from "./dto/update-post.dto";
import { unlinkSync } from "fs";
import { join } from "path";
import { UsersService } from "../users/users.service";

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
    private usersService: UsersService
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

  async getLevels() {
    return await this.levelsRepository.find();
  }

  async getContractTypes() {
    return await this.contractTypesRepository.find();
  }

  async getLanguages() {
    return await this.languagesRepository.find();
  }

  async addPost(
    authenticatedUser: User,
    addPostDto: AddPostDTO,
    logo: Express.Multer.File
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
        message: `After moderator approval, your job post will be visible to everyone`,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Adding job post failed");
    }
  }

  async getPostsForVerification() {
    return await this.jobPostsRepository
      .createQueryBuilder("jobPost")
      .innerJoin("jobPost.author", "author")
      .innerJoin("jobPost.status", "status")
      .select(["jobPost.id", "jobPost.title", "author.id", "author.username"])
      .where("status.status = :status", { status: StatusEnum.PENDING })
      .getMany();
  }

  async getDetailsForPost(postID: number) {
    try {
      return await this.jobPostsRepository
        .createQueryBuilder("jobPost")
        .innerJoin("jobPost.status", "status")
        .innerJoin("jobPost.level", "level")
        .innerJoin("jobPost.contractType", "contractType")
        .innerJoin("jobPost.author", "author")
        .innerJoin("jobPost.languages", "languages")
        .select([
          "jobPost",
          "level",
          "contractType",
          "languages",
          "author.id",
          "author.username",
        ])
        .where("jobPost.id = :id", { id: postID })
        .andWhere("status.status = :status", { status: StatusEnum.PENDING })
        .getOneOrFail();
    } catch (error) {
      throw new BadRequestException(
        "Post with this ID does not exist or does not require verification"
      );
    }
  }

  async updatePostStatus(postID: number, body: UpdatePostStatusDTO) {
    const { status } = body;
    try {
      const post = await this.jobPostsRepository
        .createQueryBuilder("jobPost")
        .innerJoin("jobPost.status", "status")
        .where("jobPost.id = :id", { id: postID })
        .andWhere("status.status = :status", { status: StatusEnum.PENDING })
        .getOneOrFail();
      post.status = <Status>await this.statusRepository.findOneBy({ status });
      await this.jobPostsRepository.save(post);
      return {
        message: "Post status updated",
      };
    } catch (error) {
      throw new BadRequestException(
        "Post with this ID does not exist or does not require verification"
      );
    }
  }

  async getAuthenticatedUserPosts(authenticatedUser: User) {
    return await this.jobPostsRepository
      .createQueryBuilder("jobPost")
      .innerJoin("jobPost.level", "level")
      .innerJoin("jobPost.contractType", "contractType")
      .innerJoin("jobPost.author", "author")
      .innerJoin("jobPost.languages", "languages")
      .innerJoin("jobPost.status", "status")
      .select(["jobPost", "level", "contractType", "languages", "status"])
      .where("author.id = :id", { id: authenticatedUser.id })
      .getMany();
  }

  async updateAuthenticatedUserPost(
    postID: number,
    updatePostDTO: UpdatePostDTO,
    logo: Express.Multer.File | undefined,
    user: User
  ) {
    const post = await this.jobPostsRepository.findOne({
      relations: ["author"],
      where: { id: postID },
    });
    if (!post) {
      throw new BadRequestException("Post with this ID does not exist");
    }
    if (post.author.id !== user.id) {
      throw new BadRequestException("You are not the author of this post");
    }

    if (logo) {
      const currentLogo = post.logo;
      unlinkSync(join(process.cwd(), `logos/${currentLogo}`));
      post.logo = logo.filename;
    }
    post.companyName = updatePostDTO.companyName || post.companyName;
    post.title = updatePostDTO.title || post.title;
    post.salary = updatePostDTO.salary || post.salary;
    post.description = updatePostDTO.description || post.description;
    post.location = updatePostDTO.location || post.location;
    if (updatePostDTO.contractType) {
      post.contractType = <ContractType>(
        await this.contractTypesRepository.findOneBy({
          type: updatePostDTO.contractType,
        })
      );
    }
    if (updatePostDTO.level) {
      post.level = <Level>await this.levelsRepository.findOneBy({
        level: updatePostDTO.level,
      });
    }
    if (updatePostDTO.languages) {
      post.languages = await this.languagesRepository.findBy({
        language: In(updatePostDTO.languages),
      });
    }
    await this.jobPostsRepository.save(post);
    return {
      message:
        "After moderator approval, your changes will be visible to everyone",
    };
  }

  async deleteAuthenticatedUserPost(postID: number, user: User) {
    const post = await this.jobPostsRepository.findOne({
      relations: ["author"],
      where: { id: postID },
    });
    if (!post) {
      throw new BadRequestException("Post with this ID does not exist");
    }
    if (post.author.id !== user.id) {
      throw new BadRequestException("You are not the author of this post");
    }
    unlinkSync(join(process.cwd(), `logos/${post.logo}`));
    await this.jobPostsRepository.delete(postID);
    return {
      message: "Post deleted",
    };
  }

  async addPostToFavourite(postID: number, authenticatedUser: User) {
    const post = await this.jobPostsRepository.findOne({
      where: { id: postID },
    });
    if (!post) {
      throw new BadRequestException("Post with this ID does not exist");
    }
    try {
      await this.usersService.addPostToFavourites(authenticatedUser, post);
      return {
        message: "Post added to favourites",
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Adding post to favourites failed"
      );
    }
  }

  async getFavouritePosts(authenticatedUser: User) {
    try {
      return await this.usersService.getFavouritePosts(authenticatedUser);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Failed to get favourite posts");
    }
  }

  async deletePostFromFavourite(postID: number, authenticatedUser: User) {
    try {
      await this.usersService.deletePostFromFavourite(
        postID,
        authenticatedUser
      );
      return {
        message: "Post deleted from favourites",
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      console.log(error);
      throw new InternalServerErrorException(
        "Failed to delete post from favourites"
      );
    }
  }
}
