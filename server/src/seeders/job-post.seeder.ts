import { Injectable } from "@nestjs/common";
import { Seeder } from "nestjs-seeder";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { JobPost } from "../entities/job-post.entity";
import { faker } from "@faker-js/faker";
import { ContractType } from "../entities/contract-type.entity";
import { Level } from "../entities/level.entity";
import { User } from "../entities/user.entity";
import { Status } from "../entities/status.entity";
import { Language, LanguageEnum } from "../entities/language.entity";
import * as fs from "node:fs";
import * as process from "node:process";
import { join } from "path";

@Injectable()
export class JobPostSeeder implements Seeder {
  constructor(
    @InjectRepository(JobPost)
    private jobPostsRepository: Repository<JobPost>,
    @InjectRepository(ContractType)
    private contractTypesRepository: Repository<ContractType>,
    @InjectRepository(Level)
    private levelsRepository: Repository<Level>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
    @InjectRepository(Language)
    private languagesRepository: Repository<Language>,
  ) {}

  async seed(): Promise<any> {
    const tableContent = await this.jobPostsRepository.find({});
    if (tableContent.length === 0) {
      const logos = fs.readdirSync(join(process.cwd(), "logos/"));
      const languagesArray = Object.values(LanguageEnum);
      for (let i = 0; i < languagesArray.length - 1; i++) {
        const post = new JobPost();
        post.companyName = faker.company.name();
        post.title = faker.person.jobTitle();
        post.salary = faker.number.int({ min: 3000, max: 10000 });
        post.logo = logos[i];
        post.description = faker.lorem.sentence();
        post.location = faker.location.city();
        post.contractType = <ContractType>(
          await this.contractTypesRepository.findOne({
            where: { id: 1 },
          })
        );
        post.level = <Level>await this.levelsRepository.findOne({
          where: { id: 1 },
        });
        post.author = <User>await this.usersRepository.findOne({
          where: { id: 1 },
        });
        post.status = <Status>await this.statusRepository.findOne({
          where: { id: 1 },
        });
        post.languages = await this.languagesRepository.findBy({
          language: In([languagesArray[i], languagesArray[i + 1]]),
        });
        await this.jobPostsRepository.save(post);
      }
    }
  }

  async drop(): Promise<any> {}
}
