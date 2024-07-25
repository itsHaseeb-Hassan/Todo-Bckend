import express from 'express';
import dotenv from 'dotenv';
import todoRouter from './routes/todoRoute.js';
import connectDB from './config/db/db.js';
import cors from 'cors';
import User from './models/userModel.js';
import Todo from './models/todoModel.js';
import upload from './midelwares/profileMidelware.js';
import { authMiddleware } from './midelwares/authMidelware.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {cloudinary} from './config/cloundinary/cloudinary.js'

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

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

app.post('/api/users/register',upload.single('profileImage') , async(req, res,next) => {
    const { name, email, password } = req.body;
    console.log("req.body", req.files);
    const profileImage = req.file;

    console.log(name, email, password, profileImage);

    if (!name || !email || !password || !profileImage) {
        return next(createHttpError(400, "All Fields Are Required"));
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(createHttpError(400, "User Already Exists"));
        }

        const filePath = profileImage.path;
        let result;
        try {
            result=await cloudinary.uploader.upload(filePath, {
                folder: "users",
            }
            )
        } catch (error) {
            return next(createHttpError(500, "Image Upload Failed"));
        }

       

            try {
                const hashedPassword = await bcrypt.hash(password, 10);

                const newUser = await User.create({
                    name,
                    email,
                    password: hashedPassword,
                    profileImage: result.secure_url,
                });

                // const accessToken= jwt.sign({id:newUser._id},process.env.JWT_SECRET_ACCESS,{expiresIn:'2h'})
    // const refreshToken= jwt.sign({id:newUser._id},process.env.JWT_SECRET_REFRESH,{expiresIn:'1d'})
    // await newUser.updateOne({refreshToken})
    console.log(newUser._id)
    res.status(200).json({id:newUser._id});
            } catch (hashError) {
                console.error('User creation error:', hashError);
                return next(createHttpError(500, "User Creation Failed"));
            }
    } catch (error) {
        console.error('User creation error:', error);
        return next(createHttpError(500, "User Creation Failed"));
    }
});

app.post('/api/users/login', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            // return next(createHttpError(400, "User Does Not Exist"));
            res.send({ status: 400, message: "User Does Not Exist" });
            // res.status(400).json({ message: "User Does Not Exist" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return next(createHttpError(400, "Wrong Password"));
        }

        const accessToken = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET_ACCESS, { expiresIn: '2h' });
        const refreshToken = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET_REFRESH, { expiresIn: '1d' });

        await existingUser.updateOne({ refreshToken });

        res.status(200).json({ id: existingUser._id, name: existingUser.name, profileImage: existingUser.profileImage, accessToken, refreshToken, isLoggedIn: true, status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return next(createHttpError(500, "Login Failed"));
    }
});
// app.use('/api/todos', todoRouter);
app.post('/api/todos/create', authMiddleware,async(req,res,next)=>{
    console.log("create todo req query", req.body);

    const { task, userId } = req.body; // Change from req.query to req.body
    console.log(task, userId);
    if (!task || !userId) {
      const error = createHttpError(400, 'All fields are required');
      return next(res.json({ error }));
    }
    try {
      const todoExist = await Todo.findOne({ userId, task });
      if (todoExist) {
        const error = createHttpError(400, 'Todo already exists for this user');
        return next(res.json({ error }));
      }
      const newTodo = new Todo({
        userId,
        task,
      });
      console.log("newTodo", newTodo);
      const savedTodo = await newTodo.save();
       res.status(201).json({ savedTodo });
    } catch (error) {
      const err = createHttpError(500, 'Internal Server Error');
      return next(res.json({ err }));
    }
});
app.get('/api/todos/getall',async (req, res, next) => {
    const { userId } = req.query;
    try {
        const todos = await Todo.find({ userId });
        res.status(200).json({ todos });
    } catch (error) {
        const err = createHttpError(500, 'Internal Server Error');
        return next(err);
    }
    });
app.post('/api/todos/complete',authMiddleware,async (req, res, next) => {
    const { id } = req.body;
    console.log("id", id);
    if (!id) {
      const error = createHttpError(400, 'All fields are required');
      return next(error);
    }
    try {
      // Find the todo item by id
      const todo = await Todo.findById(id);
      if (!todo) {
        const error = createHttpError(404, 'Todo not found');
        return next(error);
      }
  
      // Toggle the completed status
      todo.completed = !todo.completed;
  
      // Save the updated todo item
      const updatedTodo = await todo.save();
  
      res.status(200).json({ updatedTodo });
    } catch (error) {
      const err = createHttpError(500, 'Internal Server Error');
      return next(err);
    }
  })
app.put('/api/todos/update', authMiddleware,async (req, res, next) => {
    console.log("request of update todo body", req.body);
    const { id, task } = req.body;
    console.log("id, task", id, task);
    if (!id || !task) {
      const error = createHttpError(400, 'All fields are required');
      return next(error);
    }
    try {
      const updatedTodo = await Todo.findByIdAndUpdate(id, { task }, { new: true });
      res.status(200).json({ updatedTodo });
      console.log("updatedTodo", updatedTodo);
    } catch (error) {
      const err = createHttpError(500, 'Internal Server Error');
      return next(err);
    }
  });
app.delete('/api/todos/delete',authMiddleware,async (req, res, next) => {
    const { id } = req.query;
    try {
        const deletedTodo = await Todo.findByIdAndDelete(id);
        if (!deletedTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(200).json({ message: 'Todo deleted successfully', deletedTodo });
    } catch (error) {
        const err = createHttpError(500, 'Internal Server Error');
        return next(err);
    }
})

const startServer = async () => {
    try {
        await connectDB();
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1); // Exit the process with failure
    }
};

startServer();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

export default app;
