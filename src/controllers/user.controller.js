import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import uploadOnCloudinary from "../utils/Cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
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
  console.log("req body", req.body);

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
  const existedUser = User.findOne({
    $or: [{ email }, { username }],
  });
  //check for exited user
  if (existedUser) {
    throw new ApiError(409, "User with email or username already existed");
  }

  //Handling files
  // files access given by multer middleware
  const avatarlocalpath = req.files?.avatar[0]?.path;
  const coverfilepath = req.files?.cover[0]?.path;

  if (!avatarlocalpath) {
    throw new ApiError(400, "Avatar is required");
  }

  //upload them to clodinary
  const avatar = await uploadOnCloudinary(avatarlocalpath);
  const cover = await uploadOnCloudinary(coverfilepath);

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

export default registerUser;
