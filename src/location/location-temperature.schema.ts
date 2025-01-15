import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Location } from './location.schema';

@Schema({
  timestamps: true, // Automatically manages createdAt and updatedAt
  timeseries: {
    timeField: 'date', // The field that represents the time of the measurement
    metaField: 'locationId', // Metadata field for time-series collections
    granularity: 'days', // The granularity of the time-series data
  },
})
export class LocationTemperature extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Location.name,
    required: true,
  })
  locationId: MongooseSchema.Types.ObjectId; // A reference to the Location schema

  @Prop({ required: true })
  date: Date; // The date of the temperature record

  @Prop({ required: true })
  temperature: number; // The temperature recorded
}

export const LocationTemperatureSchema =
  SchemaFactory.createForClass(LocationTemperature);
