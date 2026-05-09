import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());

  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000').replace(/['"]/g, '');
  console.log(`🔒 CORS: Allowing origin: ${frontendUrl}`);

  // Explicit OPTIONS handler at raw Express level.
  // Fires before NestJS guards and before any proxy interference,
  // guaranteeing preflight requests always get the correct CORS headers.
  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    const allowedOrigins = frontendUrl.split(',').map(o => o.trim());
    
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      // Fallback to the first allowed origin
      res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Requested-With');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  app.enableCors({
    origin: frontendUrl.split(',').map(o => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend running on port ${port}`);
}

bootstrap();