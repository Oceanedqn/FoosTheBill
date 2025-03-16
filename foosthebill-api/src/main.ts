import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());  // Applique le filtre globalement

  app.enableCors({
    origin: 'http://localhost:3000', // Frontend sur localhost:3000
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes autorisées
    allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
    credentials: true, // Autoriser l'envoi de cookies et de headers d'authentification
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
