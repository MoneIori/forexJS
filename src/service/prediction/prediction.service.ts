import { Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import { Repository } from 'typeorm';
import { Eurusd } from '../../entities/eurusd';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PredictionService {
  private model: tf.LayersModel;

  constructor(
    @InjectRepository(Eurusd)
    private eurusdRepository: Repository<Eurusd>,
  ) {
    this.buildModel();
    this.trainModel().then(() => {
      console.log('Model trained and saved');
    });
  }
  findAll(): Promise<Eurusd[]> {
    return this.eurusdRepository.find();
  }
  buildModel() {
    const inputLayer = tf.input({ shape: [4, 1] }) as tf.SymbolicTensor;
    const lstmLayer = tf.layers.lstm({ units: 25, returnSequences: false });

    const forwardLstmLayer = lstmLayer.apply(inputLayer) as tf.SymbolicTensor;
    const backwardLstmLayer = lstmLayer.apply(inputLayer, {
      goBackwards: true,
    }) as tf.SymbolicTensor;

    const mergedLayer = tf.layers
      .concatenate()
      .apply([forwardLstmLayer, backwardLstmLayer]) as tf.SymbolicTensor;
    const outputLayer = tf.layers
      .dense({ units: 1 })
      .apply(mergedLayer) as tf.SymbolicTensor;

    this.model = tf.model({ inputs: inputLayer, outputs: outputLayer });

    // Compile the model
    this.model.compile({
      loss: 'meanSquaredError',
      optimizer: 'adam',
    });
  }

  calculateNormalizationFactor(data: any[]): number {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const normalizedMin = 0; // Minimum value after normalization
    const normalizedMax = 1; // Maximum value after normalization
    return (normalizedMax - normalizedMin) / (max - min);
  }

  async trainModel() {
    const candles = await this.fetchTrainingData();
    const normalizationFactorClose = this.calculateNormalizationFactor(
      candles.map((candles) => candles.close),
    );
    const normalizationFactorOpen = this.calculateNormalizationFactor(
      candles.map((candles) => candles.open),
    );
    const normalizationFactorLow = this.calculateNormalizationFactor(
      candles.map((candles) => candles.low),
    );
    const normalizationFactorHigh = this.calculateNormalizationFactor(
      candles.map((candles) => candles.high),
    );
    const input = tf.tensor3d(
      candles.map((candle) => [
        [candle.open / normalizationFactorOpen],
        [candle.high / normalizationFactorHigh],
        [candle.low / normalizationFactorLow],
        [candle.close / normalizationFactorClose],
      ]),
      [candles.length, 4, 1],
    );

    const output = tf.tensor2d(
      candles.map((candle) => [candle.close]),
      [candles.length, 1],
    );

    await this.model.fit(input, output, {
      epochs: candles.length,
      batchSize: 32,
    });

    // Save the trained model
    await this.model.save('file://./model');
  }

  async predictNextCandle(
    normalizationFactorOpen: number,
    normalizationFactorHigh: number,
    normalizationFactorLow: number,
    normalizationFactorClose: number,
  ): Promise<number> {
    const candles = await this.fetchLatestCandles();

    console.log('Candles:', candles); // Check the structure and values of the candles array

    const input = tf.tensor3d(
      candles.map((candle) => [
        [candle.open / normalizationFactorOpen],
        [candle.high / normalizationFactorHigh],
        [candle.low / normalizationFactorLow],
        [candle.close / normalizationFactorClose],
      ]),
      [1, 4, 1],
    );

    console.log('Input tensor:', await input.array());

    const prediction = this.model.predict(input) as tf.Tensor;
    const predictedCandle = (await prediction.data())[0];
    console.log('Prediction:', prediction);

    // Assuming the predictedCandle represents the price change
    // You can adjust this logic based on your specific use case
    const currentPrice = candles[0].close;
    const predictedPrice = predictedCandle;
    const formattedPrice = parseFloat(predictedPrice.toFixed(4));
    return formattedPrice;
  }

  async fetchTrainingData(): Promise<
    { high: number; low: number; close: number; open: number }[]
  > {
    const response = await this.eurusdRepository
      .createQueryBuilder()
      .select()
      .orderBy('date', 'DESC')
      .getMany();

    return response.map((candle: any) => ({
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
    }));
  }

  async fetchLatestCandles(): Promise<
    { high: number; low: number; close: number; open: number }[]
  > {
    const response = await this.eurusdRepository
      .createQueryBuilder()
      .select()
      .orderBy('date', 'DESC')
      .limit(1) // Fetch only the latest candle
      .getMany();

    return response.map((candle: any) => ({
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
    }));
  }

  setModel(model: tf.LayersModel) {
    this.model = model;
  }
}
