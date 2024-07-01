import { Injectable } from "@nestjs/common";
import { Seeder } from "nestjs-seeder";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  ContractType,
  ContractTypeEnum,
} from "../entities/contract-type.entity";

@Injectable()
export class ContractTypeSeeder implements Seeder {
  constructor(
    @InjectRepository(ContractType)
    private contractTypesRepository: Repository<ContractType>,
  ) {}

  async seed(): Promise<any> {
    const tableContent = await this.contractTypesRepository.find({});
    if(tableContent.length === 0) {
      for (const type of Object.values(ContractTypeEnum)) {
        let newContract = new ContractType();
        newContract.type = type;
        await this.contractTypesRepository.save(newContract);
      }
    }
  }

  async drop(): Promise<any> {}
}
