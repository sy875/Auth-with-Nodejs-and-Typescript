import { Types } from "mongoose";
import { User } from "../models/user.models";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import ApiResponse from "../utils/api-response";

const generateAccessAndRefeshTokens = async (
  userId: string | Types.ObjectId
) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error: any) {
    console.log(error)
    throw new ApiError(500, "Failed to generate tokens", error);
  }
};

export const signup = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this username or email already exists");
  }

  const user = await User.create({
    email,
    password,
    username,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering user");

  return res
    .status(200)
    .json(
      new ApiResponse(201, { user: createdUser }, "successfully registerd user")
    );
});

export const login = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Please provide either username or email");
  }

  if (!password) throw new ApiError(400, "Please provide password");
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordValid = user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefeshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken, user: loggedInUser },
        "User logged in successfully"
      )
    );
});
