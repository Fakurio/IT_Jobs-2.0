import { Injectable } from "@nestjs/common";
import { Seeder } from "nestjs-seeder";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  NotificationType,
  NotificationTypeEnum,
} from "src/entities/notification-type.entity";

@Injectable()
export class NotificationTypeSeeder implements Seeder {
  constructor(
    @InjectRepository(NotificationType)
    private notificationTypesRepository: Repository<NotificationType>
  ) {}

  async seed(): Promise<any> {
    const tableContent = await this.notificationTypesRepository.find({});
    if (tableContent.length === 0) {
      for (const type of Object.values(NotificationTypeEnum)) {
        let newNotification = new NotificationType();
        newNotification.type = type;
        await this.notificationTypesRepository.save(newNotification);
      }
    }
  }

  async drop(): Promise<any> {}
}
