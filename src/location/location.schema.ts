import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LocationDocument = HydratedDocument<Location>;

@Schema()
export class Location {
  _id?: Types.ObjectId;

  @Prop()
  name: string;

  @Prop({ index: '2d' })
  coordinates: number[];
}

export const LocationSchema = SchemaFactory.createForClass(Location);
