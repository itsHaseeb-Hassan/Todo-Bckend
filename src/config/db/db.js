import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        const conn= await mongoose.connect("mongodb+srv://itshaseebshaukat:admin@cluster0.mkhusfl.mongodb.net/MernTodo",{
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