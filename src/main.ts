import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //                             .header("X-RapidAPI-Key", "0fef292920msh53a8e99353c3fe4p148801jsn5c524970aa2c")
  //                             .header("X-RapidAPI-Host", "alpha-vantage.p.rapidapi.com")
  //                            .uri(URI.create("https://alpha-vantage.p.rapidapi.com/query?function=FX_INTRADAY&interval=15min&to_symbol=EUR&from_symbol=USD&datatype=json&outputsize=compact"))
  await app.listen(3000);
}
bootstrap();
