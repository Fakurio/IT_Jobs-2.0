import { RoleTypes } from '../../entities/role.entity';

export type SerializedUserDto = {
  email: string;
  roles: [{ role: RoleTypes }];
};
