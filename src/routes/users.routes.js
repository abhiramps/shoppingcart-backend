import { Router } from "express"; 
import { verifyAuth } from "../services/verify.auth.js";
import { validate ,ValidationError} from 'express-validation';

import * as  UserController from '../controllers/userController.js'

const routes=new Router();

//POST
routes.post(
    '/signup',
    validate(UserController.validation.create,{},{}),
    UserController.createUser,
);

routes.post(
    '/login',
    validate(UserController.validation.login),
    // verifyAuth,
    UserController.Login,
);

routes.post(
    '/logout',
    verifyAuth,
    UserController.Logout,
);

routes.use((err, req, res, next)=> {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json(err)
    }
    return res.status(500).json(err)
})


routes.post('/addToCart',verifyAuth,UserController.addToCart)

routes.get('/viewCart',verifyAuth,UserController.viewCart)

routes.post('/removeItem',verifyAuth,UserController.removeItem)


export default routes