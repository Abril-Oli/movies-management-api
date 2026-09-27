import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;
  let repository: {
    find: jest.Mock<() => Promise<Role[]>>;
    findOneBy: jest.Mock<(criteria: { id?: number; name?: string }) => Promise<Role | null>>;
  };

  beforeEach(() => {
    repository = {
      find: jest.fn<() => Promise<Role[]>>(),
      findOneBy: jest.fn<(criteria: { id?: number; name?: string }) => Promise<Role | null>>(),
    };
    service = new RolesService(repository as unknown as Repository<Role>);
  });

  it('lists roles ordered by ID', async () => {
    const roles = [{ id: 1, name: 'user' }, { id: 2, name: 'admin' }] as Role[];
    repository.find.mockResolvedValue(roles);

    await expect(service.findAll()).resolves.toBe(roles);
    expect(repository.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
  });

  it('finds a role by ID', async () => {
    const role = { id: 1, name: 'user' } as Role;
    repository.findOneBy.mockResolvedValue(role);

    await expect(service.findOne(1)).resolves.toBe(role);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('throws when a role ID is unknown', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('looks up roles by name', async () => {
    const role = { id: 1, name: 'user' } as Role;
    repository.findOneBy.mockResolvedValue(role);

    await expect(service.findByName('user')).resolves.toBe(role);
    expect(repository.findOneBy).toHaveBeenCalledWith({ name: 'user' });
  });
});