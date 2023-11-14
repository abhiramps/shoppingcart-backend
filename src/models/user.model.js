/* eslint-disable import/no-mutable-exports */

import  { Schema,model } from 'mongoose';

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required!'],
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required!'],
      trim: true,
      minlength: [6, 'Password need to be longer!'],
    },
    jwt:Array,
    cart:[{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }]
  },
  { timestamps: true },
);



let User = model('User', UserSchema);

export default User;
