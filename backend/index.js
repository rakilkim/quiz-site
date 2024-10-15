import express from "express";
import cors from "cors";
import dotenv from 'dotenv'
import mongoose from 'mongoose';
//import quesRoute from './routes/quesRoute.js';
import quizRoute from './routes/quizRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';
const app = express();

dotenv.config();

const MONGODBURL = process.env.MONGODBURL;
const PORT = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware for handling CORS policy
// Option 1: Allow all origins with default of cors(*)
app.use(cors());
// Option 2: Allow only specific origins
// app.use(
//     cors({
//         origin: `http://localhost:${PORT}`,
//         methods: ['GET', 'POST', 'PUT', 'DELETE' ],
//         allowedHeaders: ['Content-Type'],
//     })
// );

app.use(express.json({limit: '16mb'}));  // recognize incoming request object as JSON object
//app.use(express.urlencoded({limit: '50mb'})); // recognize incoming request object as strings or arrays

app.use('/quiz', quizRoute);

// Serve the static files from the frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handles any routes not captured by static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.get('/', (request, response) => {
    console.log(request)
    return response.status(234).send('Hi')
})

// app.listen(PORT, () => {
//     console.log(`App is listening to port: ${PORT}`)
// });

mongoose
    .connect(MONGODBURL)
    .then(() => {
        console.log('App connected to database');
        app.listen(PORT, () => {
            console.log(`App is listening to port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });
    
