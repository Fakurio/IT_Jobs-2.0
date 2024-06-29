import { Injectable } from "@nestjs/common";
import { Seeder } from "nestjs-seeder";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Level, LevelEnum } from "../entities/level.entity";

@Injectable()
export class LevelSeeder implements Seeder {
  constructor(
    @InjectRepository(Level)
    private levelsRepository: Repository<Level>,
  ) {}

  async seed(): Promise<any> {
    for (const level of Object.values(LevelEnum)) {
      let newLevel = new Level();
      newLevel.level = level;
      await this.levelsRepository.save(newLevel);
    }
  }

  async drop(): Promise<any> {
    return await this.levelsRepository.delete({});
  }
}
