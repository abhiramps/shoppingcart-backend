/* eslint-disable import/no-mutable-exports */

import  { Schema,model } from 'mongoose';

const ProductSchema = new Schema(
  {
    productId: {
      type: String,
      trim: true,
      unique:true
    },
    name: {
      type: String,
      trim: true,
    },
    price: {
      type: String,
      trim: true,
    },
    availableQty:{
      type: Number,
    },
  },
  { timestamps: true },
);



let Product = model('Product', ProductSchema);

export default Product;
