import userModel from "../models/user.model.js";

export const createUser = async ({ email, password }) => {

    if (!email || !password) {
        throw new Error("Email and password are required");
    }
    const hashedPassword = await userModel.hashPassword(password);

    const user = await userModel.create({ email, password: hashedPassword });
    
    return user;
}

export const getAllUsres= async ({userId}) => {
    const users = await userModel.find({
        _id: { $ne: userId } // Exclude the current user
    }, "-password"); // Exclude password field
    return users;
}