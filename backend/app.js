import express from 'express'
import morgan from 'morgan';
import createConnection from './db/db.js';
import userRouter from './routes/user.routes.js'
import projectRouter from './routes/project.routes.js';
import cookieParser from 'cookie-parser';
import aiRouter from './routes/ai.routes.js'
import cors from 'cors';

const app = express();
createConnection();
app.use(cors())
app.use(express.json());
app.use(cookieParser());

app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use('/users' , userRouter);
app.use('/projects' , projectRouter);

app.use('/ai' , aiRouter);


app.get('/' , (req,res)=>{

    res.status(200).json({
        msg : "hi there"
    })

});

export default app;
