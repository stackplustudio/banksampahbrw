// apps/api/src/users/dto/create-user.dto.ts
export class CreateUserDto {
  email: string;
  name: string; // Tipe string tegas (menghilangkan error 'string | undefined')
  password?: string;
  role?: string;
  nasabahId?: string;
  phone?: string;
  address?: string;
}