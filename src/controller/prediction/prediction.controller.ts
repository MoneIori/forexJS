import { Controller, Get } from '@nestjs/common';
import { PredictionService } from '../../service/prediction/prediction.service';

@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}
  @Get('/next')
  async predictNextCandle(): Promise<number> {
    const candles = await this.predictionService.findAll();
    const open = this.predictionService.calculateNormalizationFactor(
      candles.map((candles) => candles.open),
    );
    const high = this.predictionService.calculateNormalizationFactor(
      candles.map((candles) => candles.high),
    );
    const low = this.predictionService.calculateNormalizationFactor(
      candles.map((candles) => candles.low),
    );
    const close = this.predictionService.calculateNormalizationFactor(
      candles.map((candles) => candles.close),
    );
    return await this.predictionService.predictNextCandle(
      open,
      high,
      low,
      close,
    );
  }
}
