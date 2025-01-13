import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadonCloudinary} from "../utils/cloudinary.js"
import {apiResponse} from "../utils/apiResponse.js"

const registerUser = asyncHandler( async(req,res) => {
    const {fullname,email,username,password} = req.body

    // validation
    if([fullname,username,email,password].some((field) => 
        field?.trim() === "")){
        throw new apiError(400,"All fields are required")
    }

    const existUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existUser){
        throw new apiError(408,"User already exist")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverLocalPath = req.files?.coverImage?.[0]?.path
    }

    console.log("hello")
    console.log(avatarLocalPath)
    console.log(coverLocalPath);
    console.log(req.files)

    if (!avatarLocalPath){
        throw new apiError(400,"Avatar file is missing")
    }

    // const avatar = await uploadonCloudinary(avatarLocalPath)
    // let coverImage = ""

    // if(coverLocalPath){
    //      coverImage = await uploadonCloudinary(coverLocalPath)
    // }


    const avatar = await uploadonCloudinary(avatarLocalPath)
    const coverImage = await uploadonCloudinary(coverLocalPath)

    if (!avatar) {
        throw new apiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url ||"",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    )
    if(!createdUser){
        throw new apiError(501,"Something went wrong")
    }

    return res.status(201).json(new apiResponse(200,createdUser,"User registered successfully"))
})

export{registerUser}