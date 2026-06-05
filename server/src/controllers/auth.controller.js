import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { Profile } from "../models/Profile.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    const existedUser = await User.findOne({
        $or: [{ email }, { phone }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or phone already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        phone,
        role: role || "user"
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Initialize an empty profile for the new user
    await Profile.create({ user: createdUser._id });

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");

    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

const getCurrentUser =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const user =
                await User.findById(
                    req.user._id
                ).select(
                    "-password -refreshToken"
                );

            if (
                !user
            ) {
                throw new ApiError(
                    404,
                    "User not found"
                );
            }

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        user,
                        "Current user fetched"
                    )
                );
        }
    );

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/"
    };

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});

export { registerUser, loginUser, getCurrentUser, logoutUser };
