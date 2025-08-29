import { Injectable } from "@nestjs/common";
import { RolesRepository } from "./repositories/roles.repository";

@Injectable()
export class RolesService {
    constructor(
        private readonly rolesRepository: RolesRepository,
    ) {}

    async seedDefaultRoles() {
        await this.rolesRepository.seedDefaultRoles();
    }
}