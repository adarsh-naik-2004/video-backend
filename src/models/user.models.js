import mongoose,{Schema, SchemaType} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            index:true
        },
        email:{
            type:String,
            unique:true,
            required:true
        },
        fullname:{
            type:String,
            required:true,
            index:true
        },
        avatar:{
            type:String,
            required:true
        },
        coverImage:{
            type:String
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type: String,
            required: true
        },
        refreshtoken:{
            type:String
        }
    },
    {timestamps:true}
)


userSchema.pre("save", function (next){
    
    if(!this.isModified("password")){
        return next()
    }
    
    this.password = bcrypt.hash(this.password, 12) // 12 -> rounds of algorithm

    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = async function(){
    // short lived access token (jwt)
    return await jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_KEY,
    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
)
}


userSchema.methods.generateRefreshToken = async function(){
    // short lived access token (jwt)
    return await jwt.sign({
        _id:this._id,
    },
    process.env.Refresh_TOKEN_KEY,
    {expiresIn: process.env.Refresh_TOKEN_EXPIRY}
)
}


export const User = mongoose.model("User",userSchema)