import userModel from "../models/user.model.js";
import redisClient from "../services/redis.service.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";


//register user
export const createUserController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await userService.createUser(req.body);

    const token = user.generateJWT();
    delete user._doc.password; 
    res.status(201).json({ user, token });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

//login user
export const loginUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const isPasswordValid = await userModel.comparePassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).send({ error: "Invalid password" });
    }

    const token = await user.generateJWT();

    delete user._doc.password; // Remove password from user object before sending response
    res.status(200).json({ user, token });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};

export const profileController = async (req, res) => {
  console.log(req.user);
  res.status(200).json({ user: req.user });
};

export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ error: "Unauthorised User" });
    }

    // Invalidate the token in Redis (gracefully handle Redis errors)
    try {
      await redisClient.set(token, "logout", "EX", 3600 * 24); // Set token as invalid for 24 hours
    } catch (redisError) {
      // If Redis is unavailable, still allow logout but log the error
      console.warn("Redis unavailable for token blacklist, logout still processed");
    }
     
    res.status(200).send({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

export const getAllUsersController = async (req, res) => {
  try {

    const loggedInUser = await userModel.findOne({ email: req.user.email });

    const allUsers = await userService.getAllUsres({userId: loggedInUser._id});

    res.status(200).json({ allUsers });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
