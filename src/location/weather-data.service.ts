import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherDataService {
  constructor(private readonly configService: ConfigService) {}

  async fetchAndMapWeatherData(
    coordinates: number[],
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const weatherData = await this.fetch(coordinates, startDate, endDate);

    if (!weatherData || !weatherData.timestamps || !weatherData.features) {
      throw new Error('Unexpected data format from weather API.');
    }

    const timestamps = weatherData.timestamps;
    const temperatureData =
      weatherData.features[0]?.properties?.parameters?.TX?.data;

    if (!temperatureData || temperatureData.length !== timestamps.length) {
      throw new Error('Mismatch between timestamps and temperature data.');
    }

    return timestamps.map((timestamp: string, index: number) => ({
      date: timestamp,
      temperature: temperatureData[index],
    }));
  }

  private async fetch(
    coordinates: number[],
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const apiUrl = this.configService.get<string>('WEATHER_API_URL');

    const [latitude, longitude] = coordinates;

    const params = new URLSearchParams({
      lat_lon: `${longitude},${latitude}`,
      parameters: 'TX',
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });

    const url = `${apiUrl}?${params.toString()}`;

    const requestOptions: RequestInit = {
      method: 'GET',
      redirect: 'follow',
    };

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching weather data: ${error.message}`);
    }
  }
}
