import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'User email address.', example: 'user@example.com' })
  email: string;

  @ApiProperty({
    description: 'Password between 8 and 72 UTF-8 bytes.',
    minLength: 8,
    maxLength: 72,
    example: 'StrongPass123!',
  })
  password: string;
}