import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role } from '../entities/role.entity';
import { RolesService } from '../services/roles.service';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List roles' })
  @ApiOkResponse({ description: 'List of roles.', type: Role, isArray: true })
  @ApiUnauthorizedResponse({ description: 'A valid Bearer access token is required.' })
  @ApiForbiddenResponse({ description: 'Only administrators can list roles.' })
  findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Role identifier.' })
  @ApiOkResponse({ description: 'Role found.', type: Role })
  @ApiBadRequestResponse({ description: 'The ID must be an integer.' })
  @ApiNotFoundResponse({ description: 'No role exists with that ID.' })
  @ApiUnauthorizedResponse({ description: 'A valid Bearer access token is required.' })
  @ApiForbiddenResponse({ description: 'Only administrators can view roles.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.rolesService.findOne(id);
  }
}