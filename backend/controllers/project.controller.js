import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import { validationResult } from 'express-validator';
import User from '../models/user.model.js';



export const createProjectController = async(req,res)=>{

    try{const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            errors : errors.array()
        })
    }

    const {name} = req.body;
    const loggedInUser = await User.findOne({
        email : req.user.email
    })

    if(!loggedInUser){
        return res.status(400).json({
            message : "Invalid User."
        })
    }

    const userId = loggedInUser._id;

    const newProject = await projectService.createProject({
        name , userId
    });

    res.status(200).json({
        message : "Project Created.",
        newProject
    })}
        catch(err){
            console.log(err.message);
            res.status(400).json({

                message : "Error in code at createProject"

            })
        }

}


export const getAllProject = async (req,res)=>{

    try{    

        const loggedInUser = await User.findOne({
            email : req.user.email
        })

        if(!loggedInUser){
            return res.status(400).json({
                message : "not authorised to call all user."
            })
        }

        const allUserProjects = await projectService.getAllProjectsByUserId({
            userId : loggedInUser
        })

        res.status(200).json({
            message : "Got All projects by User",
            projects : allUserProjects
        }) 
    

    }catch(err){

        console.log(err);
        response.status(404).json({
            error : "Error in getAllProjects"
        })
    }

}


export const addUserToProject = async(req,res)=>{

        const errors = validationResult(req);

        if(!errors.isEmpty()){
           return res.status(400).json({
            errors : errors.array()
           });
        }

        try{

            const {projectId , users} = req.body;

            const loggedInUser = await User.findOne({
                email : req.user.email
            })
            const project = await projectService.addUserToProject({
                projectId,
                users,
                userId : loggedInUser._id
            });

            console.log(project);


            return res.status(200).json({
                project
            })

            

        }catch(err){
            console.log("Error here.")
            console.log(err);
            res.status(400).json({
                error : err.message
            })
        }

}


export const getProjectById = async(req,res)=>{

    const {projectId} = req.params;

    try{

    const projectDetails = await projectService.getProjectById({projectId});

    return res.status(200).json({projectDetails});
}
catch(err){
    console.log(err);
    res.status(400).json({
        message : "There is error in the getProjectById controller.",
        error : err.message
    })
}

}