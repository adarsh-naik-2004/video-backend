import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// const healthCheck = (req,res) => {
//     try{
//         res.status(200)
//     }
//     catch(error){
//     }
// }

// ye karna padta baar baar try catch 

const healthCheck = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(new apiResponse(200,"OK","Health OK"))
})

export {healthCheck}