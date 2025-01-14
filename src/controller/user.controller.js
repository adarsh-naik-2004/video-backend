import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadonCloudinary, deletefromCloudinary} from "../utils/cloudinary.js"
import {apiResponse} from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessandRefreshToken = async (userId) => {
   try{
        const user = await User.findById(userId)
        //
        if(!user){
            throw new apiError(501,"Something went wrong")
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken,refreshToken};
    }
    catch(error){
        throw new apiError(501,"Something went wrong")
    }

}


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
    
    try{
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
    }

    catch(error){
        console.log("User not created")

        if(avatar){
            await deletefromCloudinary(avatar.public_id)
        }

        if(coverImage){
            await deletefromCloudinary(coverImage.public_id)
        }

        throw new apiError(500, "user not created and images were deleted")
    }
})


const loginUser = asyncHandler(async (req,res) => {
    // 1) get data from body

    const {email,username,password} = req.body

    // validation 
    if(!email || !username || !password){
        throw new apiError(400,"All fields required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new apiError(404,"user not found")
    }

    // validate password

    const isPassValid = await user.isPasswordCorrect(password)

    if(!isPassValid){
        throw new apiError(401,"Wrong Password")
    }

    const {accessToken,refreshToken} = await generateAccessandRefreshToken(user._id)

    const loggedinUser = await User.findById(user._id)
    .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }

    return res.status(200).cookies("accessToken",accessToken,options).cookies("refreshToken",refreshToken,options).json (new apiError(
        200,
        {user: loggedinUser,accessToken,refreshToken},
        "user logged in successfully"))

})


const refreshAccessToken = asyncHandler(async(req,res) => {
    const newRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!newRefreshToken){
        throw new apiError(400,"something went wrong no refresh token")
    }

    try{
        const decodedToken = jwt.verify(newRefreshToken,process.env.Refresh_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new apiError(402,"invlaid refresh token")
        }

        if(user?.refreshToken !== newRefreshToken){
            throw new apiError(401,"refresh token expired")
        }

        const options = {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production"
        }
        const {accessToken, refreshToken: nayaRefreshToken} = await generateAccessandRefreshToken(user._id)

        return res.status(200).cookies("accessToken",accessToken,options).cookies("refreshToken",nayaRefreshToken,options).json(
            new apiResponse(
                200,
                {accessToken,
                    refreshToken: nayaRefreshToken
                },
                "Access token refreshed successfully"
            )
        )
    }
    catch(error){
        throw new apiError(500,"Something went wrong while refreshing access token ")
    }
})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined, // sometimes null or empty ot undefined
            }
        },
        {new: true}
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new apiResponse(200, {}, "User logged out successfully"))

})

const changeCurrentPassword = asyncHandler(async (req,res) => {
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new apiError(401, "Old password is incorrect")
    }

    user.password = newPassword;

    await user.save({validateBeforeSave: false})

    return res.status(200).json(new apiResponse(200, {}, "Password changed Successfully"))

})


const getCurrentUser = asyncHandler(async (req,res) => {
    return res.status(200).json(new apiResponse(200, req.user, "current user deatils"))
})


const updateAccountDeatils = asyncHandler(async (req,res) => {
    const {fullname, email} = req.body

    if(!fullname || !email){
        throw new apiError(400,"Full Name and email are required")
    }

    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                fullname,
                email
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    return res.status(200).json( new apiResponse(200,user,"Account details updated"))
})


const updateUserAvatar = asyncHandler(async (req,res) => {  
    const avatarLocalPath = req.files?.path
 
    if(!avatarLocalPath){
        throw new apiError(400, "File is required")
    }

    const avatar = await uploadonCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new apiError(401, "Something went wrong while uploading avatar")
    }

    const user = await user.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar:avatar.url
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res.status(200).json(new apiResponse(200,user,"Avatar updated"))
})


const updateUserCoverImage = asyncHandler(async (req,res) => {
    const coverLocalPath = req.files?.path
 
    if(!coverLocalPath){
        throw new apiError(400, "File is required")
    }

    const coverImage = await uploadonCloudinary(coverLocalPath)

    if(!coverImage.url){
        throw new apiError(401, "Something went wrong while uploading cover image")
    }

    const user = await user.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage:coverImage.url
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res.status(200).json(new apiResponse(200,user,"CoverImage updated"))
})







export{registerUser,loginUser,refreshAccessToken,logoutUser,changeCurrentPassword,getCurrentUser,updateAccountDeatils,updateUserAvatar,updateUserCoverImage}