import { Injectable } from "@nestjs/common";
import { Seeder } from "nestjs-seeder";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Language, LanguageEnum } from "../entities/language.entity";

@Injectable()
export class LanguageSeeder implements Seeder {
  constructor(
    @InjectRepository(Language)
    private languagesRepository: Repository<Language>,
  ) {}

  async seed(): Promise<any> {
    for (const lang of Object.values(LanguageEnum)) {
      let newLang = new Language();
      newLang.language = lang;
      await this.languagesRepository.save(newLang);
    }
  }

  async drop(): Promise<any> {
    return await this.languagesRepository.delete({});
  }
}
