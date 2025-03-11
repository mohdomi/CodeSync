import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import {validationResult} from 'express-validator';
import redisClient from '../services/redis.service.js';
import jwt from 'jsonwebtoken';


export const createUserController = async (req , res)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){

        return res.status(400).json({errors : errors.array()});

    }
    
    try{
        const user = await userService.createUser(req.body);
        
        const token = await user.generateJWT();

        delete user._doc.password;

        res.status(200).json({
            user , token
        });

    }catch(error){
        console.log(error);
        res.status(400).send(error.message);
    }

}


export const loginController = async (req,res)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            errors : errors.array()
        });
    }

    try{

        const {email , password} = req.body;

        const user = await userModel.findOne({
            email
        }).select("+password");

        if(!user){
            return res.status(401).json({
                errors : "Invalid Credentials."
            })
        }

        const isMatch = await user.isValidPassword(password);

        if(!isMatch){
            return res.status(401).json({
                errors : "Invalid Credentials."
            })
        }

        delete user._doc.password;

        const token = await user.generateJWT();

        res.status(200).json({
            user, token
        });

    }catch(err){

        res.status(404).json({
            error : err.message
        })


    }

}


export const profileController = async(req,res)=>{



    res.status(200).json({
        user : req.user
    })

}

export const logoutController = async (req,res)=>{

    try{
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if(!token) return res.status(401).json({message : "No token provided."});


            const decoded = jwt.verify(token , process.env.JWT_SECRET);

            if(!decoded){
                return res.status(401).json({
                    message : "Invalid Token."
                })
            }

            const output = await redisClient.set(token , 'logout' ,'EX', 60*60*24);

            res.status(200).json({
                message : "Logged out successfully"
            });

        }catch(err){
            console.log("Error : " , err);
            res.status(401).json({
                message : "Invalid token."
            })
        }

}


export const getAllUsers = async (req,res)=>{

    try{
        const loggedInUser = await userModel.findOne({
            email : req.user.email
        })

        const userId = loggedInUser._id

        const allUsers = await userService.getAllUsers({
            userId
        });

        res.status(200).json({allUsers});

    }catch(err){

        console.log(err);
        res.status(400).json({
            message : err.message
        })

    }

}