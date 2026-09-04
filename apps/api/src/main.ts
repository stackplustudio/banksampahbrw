import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Buka jalur agar Next.js (port 3000) bisa ngobrol ke sini
  app.enableCors(); 
  
  // Jalankan backend di port 3001
  await app.listen(3001); 
}
bootstrap();