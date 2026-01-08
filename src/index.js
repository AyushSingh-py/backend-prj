// require('dotenv').config()

import dotenv from "dotenv";
import connectDB from './db/index.js';

dotenv.config({
    path: './.env'
})



connectDB()
.then(()=>{
    app.on((error)=>{
        console.log("Error : ",err)
        throw error;
    })

    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at PORT : ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MONGODB connection failed !!!",err);
})


































/*    ----------------FIRST APPROACH----------------
import express from "express";
const app = express()

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`)
        app.on("error",()=>{
            console.log("ERROR : ",error);
            throw error
        })

        app.listen(process.env.PORT,()=> {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR :",error)
        throw err
    }
})()

*/