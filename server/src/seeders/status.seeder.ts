import { Injectable } from "@nestjs/common";
import { Seeder } from "nestjs-seeder";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Status, StatusEnum } from "../entities/status.entity";

@Injectable()
export class StatusSeeder implements Seeder {
  constructor(
    @InjectRepository(Status)
    private statusesRepository: Repository<Status>,
  ) {}

  async seed(): Promise<any> {
    for (const status of Object.values(StatusEnum)) {
      let newStatus = new Status();
      newStatus.status = status;
      await this.statusesRepository.save(newStatus);
    }
  }

  async drop(): Promise<any> {
    return await this.statusesRepository.delete({});
  }
}
