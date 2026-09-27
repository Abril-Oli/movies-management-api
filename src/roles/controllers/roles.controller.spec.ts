import { jest } from '@jest/globals';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
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
});