import{jwt} from "jsonwebtoken"
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","") // space ha Bearer ke baad

    if(!token){
        throw new apiError(401,"Unauthorized")
    }

    try{
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new apiError(401,"Unathorized")
        }

        req.user = user 

        next()
    }
    catch(error){
        throw new apiError(401,error?.message || "Invalid access token")
    }

})