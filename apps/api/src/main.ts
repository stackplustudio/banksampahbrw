import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS dinamis: mengizinkan Vercel dan localhost
  app.enableCors({
    origin: true, // Mengizinkan semua origin secara dinamis
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Gunakan PORT dari environment (wajib untuk platform hosting) atau 3001 untuk lokal
  const port = process.env.PORT || 3001;
  
  // Bind ke 0.0.0.0 sangat penting untuk platform container seperti Render
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();