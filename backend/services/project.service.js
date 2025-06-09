import projectModel from "../models/project.model.js";
import mongoose from "mongoose";

export const createProject = async ({ name, userId }) => {
  if (!name || !userId) {
    throw new Error("Name and userId are required");
  }

  const project = await projectModel.create({
    name,
    users: [userId],
  });

  return project;
};

export const getAllProjectsByUserID = async ({ userId }) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const allUserProjects = await projectModel.find({ 
    users: userId
 });

  return allUserProjects;
};

export const addUserToProject = async ({ projectId, users, userId }) => {
    if(!projectId){
        throw new Error("Project ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid Project ID");
    }
    if(!users){
        throw new Error("Users are required");
    }
    
    if (!Array.isArray(users) || users.length === 0) {
        throw new Error("Users must be a non-empty array");
    }
    for (const userId of users) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error(`Invalid User ID: ${userId}`);
        }
    }
    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid User ID");
    }

    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    });
    console.log({project});

    if (!project) {
        throw new Error("Project not found or user is not part of the project");
    }

    const updatedProject = await projectModel.findOneAndUpdate(
        { _id: projectId },
        { $addToSet: { users: { $each: users } } },
        { new: true }
    );

    return updatedProject;
};

export const getProjectById = async ({projectId})=>{
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid Project ID");
    }

    const project = await projectModel.findById({_id:projectId}).populate('users');

    if (!project) {
        throw new Error("Project not found");
    }

    return project;
}