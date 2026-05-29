import mongoose, { Document, Schema } from 'mongoose';

export interface ICarTags {
  company: string;
  carType: string;
  dealer: string;
  customTags: string[];
}

export interface ICar extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  tags: ICarTags;
  images: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CarTagsSchema = new Schema<ICarTags>(
  {
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    carType: {
      type: String,
      required: [true, 'Car type is required'],
      trim: true,
    },
    dealer: {
      type: String,
      required: [true, 'Dealer is required'],
      trim: true,
    },
    customTags: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const CarSchema = new Schema<ICar>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    tags: {
      type: CarTagsSchema,
      required: [true, 'Tags are required'],
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: {
        validator: (images: string[]) => images.length >= 1 && images.length <= 10,
        message: 'A car must have between 1 and 10 images',
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search performance
CarSchema.index({
  title: 'text',
  description: 'text',
  'tags.company': 'text',
  'tags.carType': 'text',
  'tags.dealer': 'text',
  'tags.customTags': 'text',
});

CarSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model<ICar>('Car', CarSchema);
