import express from 'express';
import dotenv from 'dotenv';
import userRouter from './routes/userRoute.js';
import todoRouter from './routes/todoRoute.js';
import connectDB from './config/db/db.js';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: 'http://localhost:5173', // Allow only this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    credentials: true // Allow cookies to be sent with requests
}));

// Detailed logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
    });
    next();
});

app.get('/', (req, res) => {
    res.send('Hello, this is my Todo Application');
});

app.use('/api/users', userRouter);
app.use('/api/todos', todoRouter);

// const startServer = async () => {
//     try {
//         const conn = await connectDB();
//         if(conn){
//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
        
//         })};
//     } catch (error) {
//         console.error('Failed to connect to the database:', error);
//         process.exit(1); // Exit the process with failure
//     }
// };

// startServer();

app.get("/checkdb", async(req, res) => {
    try {
           const db = connectDB();
           await db.command({ ping: 1 });
           res.json({ status: 'Connected to MongoDB' });

    } catch (error) {
        res.json({ status: 'Failed to connect to MongoDB', error: error.message });

    }
  });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

export default app;
