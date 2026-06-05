import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  category: string;
  description: string;
  colors: string[];
  sizes: string[];
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      default: "fashion",
      enum: ["fashion", "electronics", "home", "beauty", "sports"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    colors: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Product = models.Product || model<IProduct>("Product", ProductSchema);

export default Product;