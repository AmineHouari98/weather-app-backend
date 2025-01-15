import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationSchema, Location } from './location.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LocationTemperature,
  LocationTemperatureSchema,
} from './location-temperature.schema';
import { WeatherDataService } from './weather-data.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: LocationTemperature.name, schema: LocationTemperatureSchema },
    ]),
  ],
  controllers: [LocationController],
  providers: [LocationService, WeatherDataService],
})
export class LocationModule {}
