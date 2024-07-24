import express from 'express'
import dotenv from 'dotenv'
import userRouter from './routes/userRoute.js'
import todoRouter from './routes/todoRoute.js'
import connectDB from './config/db/db.js'
import cors from 'cors'

const corsconfig={
   origin:"*",
   Credentials:true,
   methods:["GET","POST","DELETE","UPDATE","PUT","PATCH"]
}

dotenv.config()

const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.options('*', cors(corsconfig))
app.use(cors(corsconfig))

app.use('/api/users',userRouter)
app.use('/api/todos',todoRouter)



connectDB().then(()=>{
    app.listen(process.env.PORT,()=>console.log(`Server is running on port ${process.env.PORT}`))
}).catch((error)=>{
    console.log(`Error:${error.message}`)
})