/* eslint-disable import/no-mutable-exports */

import  { Schema,model } from 'mongoose';

const cartSchema = new Schema(
  {
    userId:Schema.Types.ObjectId,
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
    qty:{
      type: Number,
    },
  },
  { timestamps: true },
);


let Cart = model('Cart', cartSchema);

export default Cart;
