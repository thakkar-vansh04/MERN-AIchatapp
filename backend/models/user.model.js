import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// User model schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: [6,'Email must be at least 6 characters long'],
        maxLength: [50, 'Email must be at most 50 characters long'],
    },
    password:{
        type: String,
        required: true,
        select: false, // do not return password in queries
        // minLength: [6, 'Password must be at least 6 characters long'],
        // maxLength: [50, 'Password must be at most 50 characters long'],
    }
})

userSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
}

userSchema.statics.comparePassword = async function(password, hash) {
    return await bcrypt.compare(password, hash);
}
userSchema.methods.generateJWT = function(){
    return jwt.sign({email: this.email}, process.env.JWT_SECRET)
}

const User = mongoose.model("user", userSchema);

export default User;