import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        const conn= await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
        console.log(`MongoDb connected: ${conn.connection.host}`)
    } catch (error) {
        console.log(`Error:${error.message}`)
    }
}

export default connectDB