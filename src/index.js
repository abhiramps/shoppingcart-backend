import express from 'express';
import mongodb  from '../database/mongoose.js';
import middlewares from './config/middlewares.js'
import chalk from 'chalk';

import ApiRoutes from './routes/index.js'

//PORT
const Port=process.env.PORT

//create an express app
const app=express();

//mongodb
mongodb().catch(err => console.log(err));

//use body parser middleware to parse JSON requests
middlewares(app)

//add api routes
app.use('/api',ApiRoutes)


app.listen(Port,(err)=>{
  if(err) console.log(chalk.red('Cannot run!'));
  else  console.log(chalk.green.bold(`Server ready at port: ${Port} 🚀\nENV : ${process.env.NODE_ENV} 🦄`));
})

