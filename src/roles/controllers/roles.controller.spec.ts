import { jest } from '@jest/globals';
import { GUARDS_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RolesService } from '../services/roles.service';
import { RolesController } from './roles.controller';

describe('RolesController', () => {
  let controller: RolesController;
  let rolesService: {
    findAll: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
    findOne: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
  };

  beforeEach(() => {
    rolesService = {
      findAll: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
      findOne: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    };
    controller = new RolesController(rolesService as unknown as RolesService);
  });

  it('delegates role listing', async () => {
    const roles = [{ id: 1, name: 'user' }];
    rolesService.findAll.mockResolvedValue(roles);

    await expect(controller.findAll()).resolves.toBe(roles);
  });

  it('delegates lookup by role ID', async () => {
    const role = { id: 2, name: 'admin' };
    rolesService.findOne.mockResolvedValue(role);

    await expect(controller.findOne(2)).resolves.toBe(role);
    expect(rolesService.findOne).toHaveBeenCalledWith(2);
  });

  it('declares the expected GET routes', () => {
    expect(Reflect.getMetadata(PATH_METADATA, RolesController.prototype.findAll)).toBe('/');
    expect(Reflect.getMetadata(METHOD_METADATA, RolesController.prototype.findAll)).toBe(
      RequestMethod.GET,
    );
    expect(Reflect.getMetadata(PATH_METADATA, RolesController.prototype.findOne)).toBe(':id');
  });

  it('requires an admin JWT for role routes', () => {
    expect(Reflect.getMetadata(ROLES_KEY, RolesController)).toEqual(['admin']);
    expect(Reflect.getMetadata(GUARDS_METADATA, RolesController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
    ]);
  });
});