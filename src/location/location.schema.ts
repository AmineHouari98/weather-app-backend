
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LocationDocument = HydratedDocument<Location>;

@Schema()
export class Location {
  @Prop()
  name: string;

  @Prop({ index: '2d' })
  coordinates: number[];
}

export const LocationSchema = SchemaFactory.createForClass(Location);
