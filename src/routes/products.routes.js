import { Router } from "express"; 
import { verifyAuth } from "../services/verify.auth.js";
import * as  ProductController from '../controllers/productController.js'

const routes=new Router();

//POST
routes.post('/createProduct',verifyAuth,ProductController.createProduct)

//GET
routes.get('/viewAllProducts',verifyAuth,ProductController.viewAllProducts)

export default routes