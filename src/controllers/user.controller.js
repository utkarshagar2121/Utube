import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import uploadOnCloudinary from "../utils/Cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const gererateAccessOrRefeshToken = async (userId) => {
  try {
    const userbyid = await User.findById(userId);
    // console.log("userbyid : ", userbyid);
    const accessToken = userbyid.generateAccessToken();
    const refreshToken = userbyid.generateRefreshToken();
    // console.log("refreshToken", refreshToken);
    // console.log("accessToken", accessToken);

    userbyid.refreshToken = refreshToken;
    await userbyid.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.log("error while generating tokens" + error);
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};
const registerUser = asyncHandler(async (req, res) => {
  //Steps:
  // Get Users Detail From Frontend or Using Postman
  // Send the data to the mongo model after parsing and validation(Not Empty)
  // Check if the user already exists using email and username
  // Check for images and avataar
  // send it to the cloudinary
  // Check for avatar by mutter and cloudinary
  // create the object of the user  - create entry in db
  // remove the password and the refresh token from the response
  // Check if their is any response if user created or null
  //  Send the response
  // Login User

  const { fullname, email, username, password } = req.body;
  // console.log("req body", req.body);

  //To do the validation
  // if(fullname && fullname==""){
  //   throw new ApiError(400,"Fullname is required")
  // }
  // if(email && email==""){
  //   throw new ApiError(400,"Email is required")
  // }
  // if(username && username==""){
  //   throw new ApiError(400,"Username is required")
  // }
  // if(password && password==""){
  //   throw new ApiError(400,"Password is required")
  // }

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if the user already exists using email and username
  // We need to check if the Username or the Email exist so we check for that or  condition using operators $
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  //check for exited user
  if (existedUser) {
    // console.log("there is an existed user in the database");
    // console.log("existedUser", existedUser);
    throw new ApiError(409, "User with email or username already existed");
  }

  //Pssword Validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new ApiError(
      400,
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character"
    );
  }

  // console.log(password.length);

  //Handling files
  // files access given by multer middleware

  // console.log("req.files", req.files);
  const avatarlocalpath = req.files?.avatar[0]?.path;
  // const coverfilepath = req.files?.coverImage[0]?.path;

  let coverimagelocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverimagelocalpath = req.files.coverImage[0].path;
  }

  if (!avatarlocalpath) {
    throw new ApiError(400, "Avatar is required");
  }

  // console.log("avatarlocalpath", avatarlocalpath);
  // console.log("coverfilepath", coverfilepath);

  //upload them to clodinary
  const avatar = await uploadOnCloudinary(avatarlocalpath);
  let cover;
  if (coverimagelocalpath) {
    cover = await uploadOnCloudinary(coverimagelocalpath);
  }

  // console.log("avatar", avatar);
  // console.log("cover", cover);

  if (!avatar) {
    throw new ApiError(
      400,
      "Avatar is required and some error in uploading to cloudinary"
    );
  }

  const user = await User.create({
    fullname,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: cover?.url || "",
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new ApiError(500, "Something went wrong while creating user");
  } else {
    console.log(userCreated);
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "User Created", userCreated));
});

const loginUser = asyncHandler(async (req, res) => {
  // Login User
  //todos
  /*
  1. Get the data from frontend using req.body
  2. Check if the user exists using email or username
  3. Check if the password is correct
  4. bcrypt the password and check if the password is correct
  5. Create access and refesh token 
  6. and send it back to the frontend in form of cookies
  7. Send the response with message of success login

  */

  //getting data from user
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Email or username is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  //query to find using email or username
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  // if user not found
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //check if password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password is incorrect");
  }

  //create access and refresh token
  const { accessToken, refreshToken } = await gererateAccessOrRefeshToken(
    user._id
  );

  const loggeduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //send the responses to the cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "Login Success", {
        loggeduser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // Logout User
  // we will find the user by the findById
  // we wil make a middleware for getting the user

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", "", options)
    .cookie("refreshToken", "", options)
    .json(new ApiResponse(200, {}, "Logout Success"));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  //You can access refershh token from cookies
  const incomingrefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if(!incomingrefreshToken){
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decoded = jwt.verify(
      incomingrefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );
  
    if (!user) {
      throw new ApiError(401, "Inavlid Refresh Token");
    }
  
    if(incomingrefreshToken !== user.refreshToken){
      throw new ApiError(401, "Refresh Token is expired");
    }
  
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    const { accessToken, newefreshToken } = await gererateAccessOrRefeshToken(
      user._id
    );
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newefreshToken, options)
      .json(
        new ApiResponse(200, "Access Token Refreshed Successfully", {
          user,
          accessToken,
          newefreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, error?.message + "Inavlid Refresh Token");
  }

});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
