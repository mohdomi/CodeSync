import 'dotenv/config'
import http from 'http'
import app from './app.js'
import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Project from './models/project.model.js';
import { generateResult } from './services/gemini.service.js';
const port = process.env.PORT || 3000;

const server =  http.createServer(app);
const io = new Server(server , {
        cors : {
                origin : process.env.FRONTEND_URL 
        }
});


io.use(async (socket , next)=>{

        try{
                const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];

                const projectId = socket.handshake.query.projectId;

                if(!mongoose.Types.ObjectId.isValid(projectId)){
                        return next(new Error('Invalid ProjectId'));
                } 

                socket.project = await Project.findById(projectId);

                if(!token){
                        return next(new Error('Authentication error.'));
                }

                const decoded = jwt.verify(token , process.env.JWT_SECRET);

                if(!decoded){
                        return next(new Error('Token not authorized'));
                }

                socket.user = decoded;

                next();



        }catch(err){
                next(err);
        }

})


io.on('connection' , (socket)=>{

        socket.roomId = socket.project._id.toString();

        console.log('a user is connected');

        socket.join(socket.roomId);


        socket.on('project-message' , async data => {

                const {message , sender} = data;

                console.log(data);
                console.log(message);

                const isAIpresentInMessage = message.trim().match(/^.{1,3}/)?.[0];
                socket.broadcast.to(socket.roomId).emit('project-message' , data)

                if(isAIpresentInMessage === '@ai'){

                        const prompt = message.trim().replace('@ai' , '');

                        const result = await generateResult(prompt);

                        io.to(socket.roomId).emit('project-message' , {
                               
                                message : result,

                                sender : {
                                        _id : "ai",
                                        email : 'AI'
                                }


                        })
                        
                }

        })

        socket.on('event' ,()=>{/**/ } )
        socket.on('disconnect' , ()=>{
                console.log("the user disconnected")
                socket.leave(socket.roomId);
        })
        
})


server.listen(port , ()=>{


        console.log(`Server is live on ${port}`);

})