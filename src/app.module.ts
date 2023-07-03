import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Eurusd } from './entities/eurusd';
import { PredictionService } from './service/prediction/prediction.service';
import { PredictionController } from './controller/prediction/prediction.controller';
import { CandleScheduler } from './service/prediction/CandleScheduler';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '192.168.2.115',
      port: 3306,
      username: 'root',
      password: 'admin',
      database: 'Forex',
      entities: [Eurusd],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Eurusd]),
  ],
  controllers: [AppController, PredictionController],
  providers: [AppService, PredictionService, CandleScheduler],
})
export class AppModule {}
