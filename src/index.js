import express from 'express'
import dotenv from 'dotenv'
import userRouter from './routes/userRoute.js'
import todoRouter from './routes/todoRoute.js'
import connectDB from './config/db/db.js'
import cors from 'cors'


dotenv.config()

const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:false}))
// app.options('*', cors(corsconfig))
app.use(cors(
    {
        origin: 'http://localhost:5173', // Allow only this origin
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
        credentials: true // Allow cookies to be sent with requests
    }
))




app.get('/',(req,res)=>{
    res.send('Hello this is my Todo Application');
})

app.use('/api/users',userRouter)
app.use('/api/todos',todoRouter)

connectDB()


app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)

})

export default app



