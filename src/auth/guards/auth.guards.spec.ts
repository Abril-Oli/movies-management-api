import { jest } from '@jest/globals';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { RoleName, ROLES_KEY } from '../decorators/roles.decorator';

interface RequestMock {
  headers: { authorization?: string };
  user?: { sub: number; email: string; roleId: number; role: string };
}

function createContext(request: RequestMock): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: {
    verifyAsync: jest.Mock<() => Promise<{ sub: number; email: string; roleId: number; role: string }>>;
  };

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn<
        () => Promise<{ sub: number; email: string; roleId: number; role: string }>
      >(),
    };
    guard = new JwtAuthGuard(jwtService as unknown as JwtService);
  });

  it('rejects requests without a Bearer token', async () => {
    const context = createContext({ headers: {} });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('verifies the token and attaches its claims to the request', async () => {
    const request: RequestMock = { headers: { authorization: 'Bearer signed-token' } };
    const claims = { sub: 7, email: 'user@example.com', roleId: 1, role: 'user' };
    jwtService.verifyAsync.mockResolvedValue(claims);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('signed-token');
    expect(request.user).toEqual(claims);
  });

  it('rejects invalid or expired tokens', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('expired'));
    const context = createContext({ headers: { authorization: 'Bearer expired-token' } });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock<(...args: unknown[]) => RoleName[] | undefined> };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn<(...args: unknown[]) => RoleName[] | undefined>(),
    };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('rejects requests without an authenticated user', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin'] satisfies RoleName[]);

    expect(() => guard.canActivate(createContext({ headers: {} }))).toThrow(
      UnauthorizedException,
    );
  });

  it('allows a user whose role is listed in handler metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin'] satisfies RoleName[]);
    const request: RequestMock = {
      headers: {},
      user: { sub: 7, email: 'admin@example.com', roleId: 2, role: 'admin' },
    };

    expect(guard.canActivate(createContext(request))).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, expect.any(Array));
  });

  it('rejects users whose role is not allowed', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin'] satisfies RoleName[]);
    const request: RequestMock = {
      headers: {},
      user: { sub: 8, email: 'user@example.com', roleId: 1, role: 'user' },
    };

    expect(() => guard.canActivate(createContext(request))).toThrow(ForbiddenException);
  });

  it('rejects access when the route has no role metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const request: RequestMock = {
      headers: {},
      user: { sub: 8, email: 'user@example.com', roleId: 1, role: 'user' },
    };

    expect(() => guard.canActivate(createContext(request))).toThrow(ForbiddenException);
  });
});