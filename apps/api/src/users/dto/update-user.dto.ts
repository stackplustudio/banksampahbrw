import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// Otomatis meng-copy isi CreateUserDto tapi sifatnya opsional (boleh dikosongkan saat update)
export class UpdateUserDto extends PartialType(CreateUserDto) {}