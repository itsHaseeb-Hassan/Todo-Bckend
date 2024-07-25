import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        const conn= await mongoose.connect("mongodb+srv://itshaseebshaukat:admin@cluster0.mongodb.net/MernTodo?retryWrites=true&w=majority",{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
        return conn;
        console.log(`MongoDb connected:`)
    } catch (error) {
        console.log(`Error:${error.message}`)
    }

}

export default connectDB