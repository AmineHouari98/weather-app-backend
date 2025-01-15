import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './location.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LocationTemperature } from './location-temperature.schema';
import { WeatherDataService } from './weather-data.service';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<Location>,
    @InjectModel(LocationTemperature.name)
    private locationTempModel: Model<LocationTemperature>,
    private weatherDataService: WeatherDataService,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const createdLocation = new this.locationModel(createLocationDto);
    return await createdLocation.save();
  }

  async findAll(): Promise<Location[]> {
    return await this.locationModel.find().exec();
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.locationModel.findById(id).exec();
    if (!location) {
      throw new NotFoundException(`Location with ID "${id}" not found`);
    }
    return location;
  }

  async update(
    id: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const updatedLocation = await this.locationModel
      .findByIdAndUpdate(id, updateLocationDto, { new: true })
      .exec();
    if (!updatedLocation) {
      throw new NotFoundException(`Location with ID "${id}" not found`);
    }
    return updatedLocation;
  }

  async remove(id: string): Promise<Location> {
    const deletedLocation = await this.locationModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedLocation) {
      throw new NotFoundException(`Location with ID "${id}" not found`);
    }
    return deletedLocation;
  }

  async getData(id: string, from: Date, to: Date) {
    const location = await this.findOne(id);

    let temps = await this.getTemperatureData(location, from, to);

    if (temps.length === 0) {
      temps = await this.fetchAndSaveLocationTemperature(location, from, to);
    }

    return temps;
  }

  async fetchAndSaveLocationTemperature(
    location: Location,
    from: Date,
    to: Date,
  ): Promise<any> {
    // Fetch weather data
    const temps = await this.weatherDataService.fetchAndMapWeatherData(
      location.coordinates,
      from,
      to,
    );

    // Map and save data
    const locationTemperatures = temps.map((temp) => ({
      locationId: location._id,
      date: new Date(temp.date),
      temperature: temp.temperature,
    }));

    // Insert the mapped data into the database
    const savedRecords =
      await this.locationTempModel.insertMany(locationTemperatures);

    return savedRecords;
  }

  async getTemperatureData(
    location: Location,
    from: Date,
    to: Date,
  ): Promise<LocationTemperature[]> {
    const result = await this.locationTempModel.aggregate([
      {
        $match: {
          locationId: location, // Match by locationId
          date: { $gte: from, $lte: to }, // Match dates in the range [from, to]
        },
      },
      {
        $project: {
          locationId: 1,
          date: 1,
          temperature: 1,
        },
      },
      {
        $sort: { date: 1 }, // Sort by date
      },
    ]);

    return result;
  }
}
