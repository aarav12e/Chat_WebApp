import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const signup = (req, res) => {
    const {fullName, emial, password} = req.body;
    try {
        if (password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }
        const user = await User.findOne({email})

        if (user) return res.status(400).json({message: "Email already exists"});
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        const newUser = new User ({
            fullName,
            email,
            password: hashedPassword
        })
        if(newUser) {

        }else {
            res.status(400).json({ message: "Invalid user data"});
        }


    } catch (error) {
        
    }
};

export const login = (req, res) => {
    res.send("Login route");
};      

export const logout = (req, res) => {
    res.send("Logout route");
};