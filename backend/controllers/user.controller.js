import userModel from "../models/user.model.js";
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
    res.status(200).json({user: req.user});
};
