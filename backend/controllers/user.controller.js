import userModel from "../models/user.model.js";
import redisClient from "../services/redis.service.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";

export const createUserController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await userService.createUser(req.body);

    const token = user.generateJWT();

    res.status(201).json({ user, token });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

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
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).send({ error: "Unauthorised User" });
    }

    // Invalidate the token in Redis
    await redisClient.set(token, "logout", "EX", 3600 * 24); // Set token as invalid for 1 hour
    // await redisClient.set(token, "Invalid", "EX", 3600 * 24); // Set token as invalid for 1 hour

    res.status(200).send({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};
