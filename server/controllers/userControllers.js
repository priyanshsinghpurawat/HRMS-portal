import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function register(req, res) {
    try {
        const { name, title, email, password, phone } = req.body;

        if (!name || !title || !email || !password || !phone) {
            return res.status(400).json({
                succuss: false,
                message: "all fields are required"
            });
        };

        let existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(409).json({
                succuss: false,
                message: "User already exist"
            });
        };
        const salt = 10;
        const hashpassword = await bcrypt.hash(password, salt);

        const Candidate = new User({
            name,
            title,
            email,
            password: hashpassword,
            phone
        });

        const newUser = await Candidate.save();
        newUser.password = undefined;

        const token = await jwt.sign({ payload: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '2d' });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 2 * 24 * 60 * 60 * 1000
        });
        return res.status(201).json({
            succuss: true,
            message: "Candidate Registered Succussfully!",
            data: newUser,
            token
        });
    } catch (error) {
        return res.status(500).json({
            succuss: false,
            message: error.message
        });
    }
}

export async function login(req, res) {
    try {

    } catch (error) {
        res.status(500).json({
            success: false,

        })
    }
}