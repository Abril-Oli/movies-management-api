import { jest } from '@jest/globals';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
    login: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
  };

  beforeEach(() => {
    authService = {
      register: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
      login: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    };
    controller = new AuthController(authService as unknown as AuthService);
  });

  it('delegates sign-up and returns the service response', async () => {
    const dto = { email: 'user@example.com', password: 'StrongPass123!' };
    const response = { message: 'User created successfully.' };
    authService.register.mockResolvedValue(response);

    await expect(controller.register(dto)).resolves.toBe(response);
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('delegates sign-in and returns its JWT response', async () => {
    const dto = { email: 'user@example.com', password: 'StrongPass123!' };
    const response = { access_token: 'jwt', token_type: 'Bearer', expires_in: 3600 };
    authService.login.mockResolvedValue(response);

    await expect(controller.login(dto)).resolves.toBe(response);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('exposes the expected public POST routes', () => {
    expect(Reflect.getMetadata(PATH_METADATA, AuthController.prototype.register)).toBe('/sign-up');
    expect(Reflect.getMetadata(METHOD_METADATA, AuthController.prototype.register)).toBe(
      RequestMethod.POST,
    );
    expect(Reflect.getMetadata(PATH_METADATA, AuthController.prototype.login)).toBe('/sign-in');
    expect(Reflect.getMetadata(METHOD_METADATA, AuthController.prototype.login)).toBe(
      RequestMethod.POST,
    );
  });
});