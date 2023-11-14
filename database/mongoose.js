// getting-started.js
import { connect, set } from 'mongoose';
import chalk from 'chalk';

import 'dotenv/config'

let mongo_connection_url = process.env.MONGODB_URL

async function main() {
    set("strictQuery", true);
    await connect(mongo_connection_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(
            () => { console.log(chalk.green.bold("mongoDB connected to server...🚀")) },  
            err => console.log(chalk.red("Cannot connect to MongoDB Server"),err)
        )

    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}



export default main