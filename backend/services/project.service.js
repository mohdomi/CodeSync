import projectModel from "../models/project.model.js";
import mongoose from 'mongoose'


export const createProject = async ({
    name, userId
})=>{
        
    if(!name){
        throw new Error('Name is required');
    }

    if(!userId){
        throw new Error('User is required');
    }

    let project;

    try{
        project = await projectModel.create({
            name , users : [
                userId
            ]
        });

    }catch(error){
        if(error.code === 11000){
            throw new Error('Project name already exists');
        }

        throw error;
    }

    return project;

}


export const getAllProjectsByUserId = async({userId})=>{

    if(!userId){
        throw new Error('User id is requried');
    }

    const allUserProjects = await projectModel.find({
        users: userId
    })

    return allUserProjects;
}


export const addUserToProject = async ({projectId , users , userId})=>{


    if(!projectId){
        throw new Error("project id is requried");
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){

        throw new Error("Invalid ProjectId")
    }

    if(!users){
        throw new Error("users are required");
    }

    if(!Array.isArray(users) || users.some(userId =>{
        return !mongoose.Types.ObjectId.isValid(userId)
    })){
        throw new Error("Invalid userId(s) in users array.")
    }

    if(!userId){
        throw new Error("userId is requried");
    }

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new Error("Invalid userId.")
    }
      
    const project = await projectModel.findOne({
        _id : projectId,
        users: userId
    })

    // console.log(project);

    if(!project){
        throw new Error("Unauthorised access to this project.")
    }

    const updatedProject = await projectModel.findOneAndUpdate(
        { _id: projectId },
        {
            $addToSet: {
                users: { $each: users } // Correct syntax
            }
        },
        { new: true }
    );
    

    console.log("Updated Project : " , updatedProject);


    return updatedProject;

}


export const getProjectById = async({projectId})=>{

    if(!projectId){
        throw new Error("projectId is required");
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("Enter a valid projectId");
    }

    const projectDetails = await projectModel.findOne({
        _id : projectId
    }).populate('users');

    return projectDetails;
}