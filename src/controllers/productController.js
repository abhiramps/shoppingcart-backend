import HTTPStatus from "http-status";
import Product from "../models/product.model.js";

export const createProduct = async (req, res, next) => {
  try {
    const { productId } = req.body;
    console.log("req.body", req.body);
    // return
    const isProduct = await Product.findOne({ productId }, { productId: 1 });
    if (isProduct) {
      res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "product already exists" });
      return next();
    }

    const result = await Product.create(req.body);
    if (!result) {
      res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json("Unable to create product");
      return next();
    }

    res
      .status(HTTPStatus.CREATED)
      .json({ message: "New Product created successfully!!" });
  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    console.log("createProduct Error", e);
    return next(e);
  }
};

export const viewAllProducts = async (req, res, next) => {
  try {
    // return
    const productsList = await Product.find({});
    res.status(HTTPStatus.CREATED).json({ productsList });
  } catch (e) {
    e.status = HTTPStatus.BAD_REQUEST;
    console.log("viewAllProducts Error", e);
    return next(e);
  }
};


