import mongoose, { Schema } from "mongoose";
import bcrypt from bcrypt;
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    index: true, // for searching field more expensive but good
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  avatar:{
    type: String, //Cloudinary URL
    required: true

  },
  coverImage:{
    type: String, //Cloudinary URL
  },
  watchHistory:[
    {
    type:Schema.Types.ObjectId,
    ref:"Video"
  }],
  password: {
    type: String,
    required: [true,"Password is required"],
  },
  refreshTokens:{
    type:String,

  }
},{
  timestamps: true
});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password=bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
    {
        _id:this._id,
        email:this.email,
        fullname:this.fullname,
        username:this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESSS_TOKEN_EXPIRY
    }
)
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
    {
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export const User = mongoose.model("User", userSchema);
