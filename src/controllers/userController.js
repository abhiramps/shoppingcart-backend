import { Joi } from "express-validation";
import User from "../models/user.model.js";
import HTTPStatus from "http-status";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import { Types } from "mongoose";

// import ObjectId  from 'mongoose'.Types.ObjectId;
/**
 * Generate a jwt token for authentication
 *
 * @public
 * @returns {String} token - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
    },
    process.env.SECRET_KEY,
    { expiresIn: "240h" }
  );
};

export const validation = {
  create: {
    body: Joi.object({
      email: Joi.string().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      password: Joi.string()
        .min(6)
        .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/)
        .required(),
    }),
  },
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string()
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
    }),
  },
};

export const createUser = async (req, res, next) => {
  try {
    const isUser = await User.findOne({ email: req.body.email }, { email: 1 });
    if (isUser) {
      res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "user already there" });
      return next();
    }
    // Encrypt password
    let hashPassword = await bcrypt.hash(req.body.password, 12);
    req.body.password = hashPassword;

    const result = await User.create(req.body);
    if (!result) {
      res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json("Unable to create user");
      return next();
    }

    res
      .status(HTTPStatus.CREATED)
      .json({ message: "User created successfully!!" });
  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    console.log("createUser Error", e);
    return next(e);
  }
};

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("req", req.body);
    const user = await User.findOne(
      { email },
      { email: 1, password: 1, firstName: 1 }
    );

    if (!user) {
      res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "User Not found !!" });
      return next();
    }

    // validate the password
    const match = await bcrypt.compare(password, user.password);

    // If password is incorrect
    if (match) {
      // Generate token for the user
      const token = generateToken(user);

      if (!token)
        res
          .status(HTTPStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error generating token" });

      const updateUser = await User.updateOne(
        { _id: user._id },
        { $push: { jwt: token } }
      );

      if (!updateUser) {
        res
          .status(HTTPStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error Creating session" });
        return next();
      }

      res.status(200).json({ token });
      return next();
    } else {
      res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Wrong credentials !!" });
      return next();
    }
  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    console.log("Login Error", e);
    return next(e);
  }
};

export const Logout = async (req, res, next) => {
  try {
    const updateUser = await User.updateOne(
      { jwt: req.user.token },
      { $pull: { jwt: req.user.token } }
    );
    if (updateUser.modifiedCount < 1) {
      res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Unable to logout User!!" });
      return next();
    }
    res.status(200).json({ message: "User logged out successfully !!" });
  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    console.log("Logout Error", e);
    return next(e);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, userId, qty } = req.body;
    // return
    const findProduct = await Product.findOne({
      productId,
      availableQty: { $gte: qty },
    });
    // console.log("findProduct", findProduct);
    // return
    if (!findProduct) {
      res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "requested quantity exceeds the available stock" });
      return next();
    }

    //check if product is already added
    let findCartItem = await Cart.findOne(
      { productId },
      { productId: 1, qty: 1 }
    );

    //if added:: update the qty
    if (findCartItem) {
      let updateCart = await Cart.updateOne(
        { _id: findCartItem._id },
        {
          $set: {
            qty: findCartItem.qty + qty,
          },
        }
      );
      if (updateCart.modifiedCount < 1) {
        res
          .status(HTTPStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Add Product To Cart Failed!!" });
        return next();
      }
    }
    //add product to cart
    else {
      let cart = await Cart.create({
        userId: userId,
        productId: findProduct.productId,
        name: findProduct.name,
        price: findProduct.price,
        qty: qty,
      });
      // console.log("cart",cart)
      //add cart id in user cart array
      const addProductToCart = await User.updateOne(
        { _id: userId },
        {
          $push: {
            cart: cart._id,
          },
        }
      );

      if (addProductToCart.modifiedCount < 1) {
        res
          .status(HTTPStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Add Product To Cart Failed!!" });
        return next();
      }
    }

    //subtract qty from available qty
    const updateProductQty = await Product.updateOne(
      { productId },
      {
        $set: {
          availableQty: findProduct.availableQty - qty,
        },
      }
    );

    if (updateProductQty.modifiedCount < 1) {
      res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Update Product Qty Failed!!" });
      return next();
    }

    res.status(200).json({ message: "Add Product To Cart Success" });
  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    console.log("addToCart Error", e);
    return next(e);
  }
};

export const viewCart = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const userIdObject = new Types.ObjectId(userId);

    // console.log("req.query", req.query);

    //check if product is already added
    let findCartItem = await Cart.aggregate([
      {
        $match: {
          userId: userIdObject,
        }
      },
      {
        $addFields: {
          prodTotal: { $multiply: [ { $toInt: '$qty' }, { $toInt: '$price' } ] },
        },
      },
      {
        $group:{
          _id: null,
          cartItems:{
            $push: {
              _id: '$_id',
              caseId: '$caseId',
              productId: '$productId',
              name: '$name',
              price:'$price',
              qty:'$qty',
          }
          },
          total: { $sum: '$prodTotal' },
        }
      }
    ]);

    // console.log("findCartItem", JSON.stringify(findCartItem,0,2));

    // return;
    res.status(200).json({ cart:findCartItem });
  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    console.log("viewCart Error", e);
    return next(e);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const { productId, userId, qty } = req.body;
    // console.log("req.body",req.body)
    let findCartItem = await Cart.findOne(
      { productId },
      { productId: 1, qty: 1 }
    );

    if (findCartItem.qty>qty) {
      let updateCart = await Cart.updateOne(
        { _id: findCartItem._id },
        {
          $set: {
            qty: findCartItem.qty - qty,
          },
        }
      );
      if (updateCart.modifiedCount < 1) {
        res
          .status(HTTPStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Product remove from Cart Failed!!" });
        return next();
      }
      const updateQty = await Product.updateOne({ productId},{
        $set:{
          availableQty:findCartItem.qty+qty
        }
      });

      if (updateQty.modifiedCount < 1) {
        res
          .status(HTTPStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Product remove from Cart Failed!!" });
        return next();
      }
      res.status(200).json({ message: "Product removed from Cart Success" });
    }
    else if(findCartItem.qty==qty){
      let updateCart = await Cart.deleteOne(
        { productId },
      );

      const updateQty = await Product.updateOne({ productId},{
        $set:{
          availableQty:findCartItem.qty+qty
        }
      });

      let removeItemFromUser = await User.updateOne(
        { userId },
        {
          $pull:{
            cart: new Types.ObjectId(findCartItem._id)
          }
        }
      );

      

      if (updateCart.modifiedCount < 1) {
        res
          .status(HTTPStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Product remove from Cart Failed!!" });
        return next();
      }

      res.status(200).json({ message: "Product removed from Cart Success" });
    }
   
    else {
        res
          .status(HTTPStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "QTY should not be negative" });
        return next();
    }

   
  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    console.log("removeItem Error", e);
    return next(e);
  }
};
