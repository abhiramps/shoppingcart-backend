import { Router } from "express";
import UsersRoutes from './users.routes.js'
import ProductsRoutes from './products.routes.js'

const routes = new Router();

routes.use("/users",UsersRoutes);
routes.use("/products",ProductsRoutes);

export default routes