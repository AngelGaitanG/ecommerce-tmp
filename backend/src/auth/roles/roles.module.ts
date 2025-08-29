import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';
import { RolesRepository } from './repositories/roles.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([Role])
    ],
    providers: [RolesService, RolesRepository],
    exports: [RolesService, RolesRepository]
})
export class RolesModule {
    constructor(private readonly rolesService: RolesService) {}

    async onModuleInit() {
        await this.rolesService.seedDefaultRoles();
    }
}
