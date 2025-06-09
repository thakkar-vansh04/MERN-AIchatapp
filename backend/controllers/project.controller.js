import projectModel from "../models/project.model.js";
import * as projectService from "../services/project.service.js";
import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";

export const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name } = req.body;
    const loggedInUser = await userModel.findOne({ email : req.user.email });
    const userId = loggedInUser._id;

    const newProject =  await projectService.createProject({ name, userId });

    res.status(201).json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error creating project",
      error: error.message,
    });
  }
};

export const getAllProjects = async (req, res) => {

    try {
      
      const loggedInUser = await userModel.findOne({ 
        email: req.user.email
       });

      const allUserProjects = await projectService.getAllProjectsByUserID({ 
        userId: loggedInUser._id
      }); 

      return res.status(200).json({
        message: "All projects fetched successfully",
        projects: allUserProjects,
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({error: error.message});
    }

}

export const addUserToProject = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, users } = req.body;

    const loggedInUser = await userModel.findOne({ email: req.user.email });
    
    const project = await projectService.addUserToProject({
      projectId,
      users,
      userId: loggedInUser._id,
    });

    return res.status(200).json({
      message: "Users added to project successfully",
      project,
    });

  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }

}

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  try {
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await projectService.getProjectById({ projectId });

    return res.status(200).json({
      message: "Project fetched successfully",
      project,
    });

  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};
