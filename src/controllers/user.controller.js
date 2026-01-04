import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async(req,res) => {
    //get user detals from frontend
    //validation- not empty
    //check if user already exist: username email
    // check for avatar and images
    // upload them to cloudinary , avatar 
    //create user object - create entry in db
    // remove passsword and refresh token filed from response
    // check for user creation
    // return res

    const {fullName, email, username, password} = req.body
    console.log("email:",email);

    if (
        [fullName,email,username,password].some(() =>
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are requires")
    }

    const existedUser = User.findOne({
        $or: [{ username },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409,"user with email or username already exist")
    }

    const avatarLocalpath = req.files?.avatar[0]?.path;
    const coverImageLocalpath = req.files?.coverImage[0]?.path;

    if (!avatarLocalpath) {
        throw new ApiError(400," Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalpath)
    const coverimage = await uploadOnCloudinary(coverImageLocalpath)

    if (!avatar) {
        throw new ApiError(400," Avatar file is required")
    }

     const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?url || "",
        email,
        password,
        username: username.toLowerCase()
    })

   const  createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if (!createdUser) {
    throw new ApiError(500, "something went wrong while regestring the user")
   }

   return res.status(201).json({
    new ApiResponse(200,  createdUser, "user registered succesfully")
   })

})


export {registerUser,}