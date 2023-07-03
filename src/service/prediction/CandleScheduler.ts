import { Injectable } from '@nestjs/common';
import * as cron from 'node-cron';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Eurusd } from '../../entities/eurusd';
import { Repository } from 'typeorm';

@Injectable()
export class CandleScheduler {
  constructor(
    @InjectRepository(Eurusd)
    private eurusdRepository: Repository<Eurusd>,
  ) {
    this.setupScheduler();
  }

  private setupScheduler() {
    cron.schedule('*/15 * * * *', async () => {
      try {
        const headers = {
          'X-RapidAPI-Key':
            '0fef292920msh53a8e99353c3fe4p148801jsn5c524970aa2c',
          'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com',
        };

        const response = await axios.get(
          'https://alpha-vantage.p.rapidapi.com/query?function=FX_INTRADAY&interval=15min&to_symbol=EUR&from_symbol=USD&datatype=json&outputsize=compact',
          { headers },
        );

        // Process the response or save the data
        console.log(response.data);
        const newCandle = new Eurusd();
        const parsedData = JSON.parse(response.data);
        const timeSeries = parsedData['Time Series FX (15min)'];

        const firstData = Object.values(timeSeries)[0];
        newCandle.date = new Date();
        newCandle.open = parseFloat(firstData['1. open']);
        newCandle.high = parseFloat(firstData['2. high']);
        newCandle.low = parseFloat(firstData['3. low']);
        newCandle.close = parseFloat(firstData['4. close']);
        await this.eurusdRepository.save(newCandle);
      } catch (error) {
        console.error('Error calling the API:', error);
      }
    });
  }
}
