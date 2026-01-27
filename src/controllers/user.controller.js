import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async(userId){
    try {
        const user = await User.findById(userId)

        const AccesToken = user.generateAccessToken()
        const RefreshToken = user.generateRefreshToken()

        user.RefreshToken = RefreshToken
        await user.save({validateBeforeSave : false})

        return {AccesToken,RefreshToken}


    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh tokens.")
    }
}


const registerUser = asyncHandler( async (req,res) => {
    // get user details from frontend
    // validation - any required field is empty
    // check if user already exists : username , emails
    // check for images , check for avatar
    // upload to cloudinary, avatar 
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName,email,userName,password} = req.body
    // console.log("Full Name : ",fullName)
    // console.log("Email : ",email)
    // console.log("User Name : ",userName)
    // console.log("Password : ",password)


    // if(
    // [fullName,userName,email,password].some((field) => field?.trim() === "")
    // ){
    //     throw new ApiError(400,"All fields are required")
    // }
    
    
    if(fullName=== ""){
        throw new ApiError(400, "Full Name is Required !!!")
    }
    if(userName=== ""){
        throw new ApiError(400, "User Name is Required !!!")
    }
    if(email=== ""){
        throw new ApiError(400, "Email is Required !!!")
    }
    if(password=== ""){
        throw new ApiError(400, "Password is Required !!!")
    }


    const existedUser = await User.findOne({
        $or : [{userName} , {email}]
    })
    
    if(existedUser){
        throw new ApiError(409,"Username or Email is already exists.")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is Required !!!")        
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400,"Avatar file is Required !!!")   
    }

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "" ,
        email,
        password,
        userName : userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went Wrong while registering a User.")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, " User Registered Succesfully.")
    )

})


const loginUser = asyncHandler( async (req,res) => {
    // re body -> data
    // get user details from frontend - username or email
    // find the user
    // password check
    // access and refresh token generation
    // send cookies
    // res

    const {email,username,password} = req.body

    if (!email || !username) {
        throw new ApiError ( 400, "username or password is required !")
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if (!user) {
        throw new ApiError(404,"Username does not exists.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401,"Invaild Password.")
    }

    const {RefreshToken,AccesToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._Id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true

    }

    return res.status(200).cookie("accessToken",AccesToken,options)
    .cookie("refreshToken",RefreshToken,options)
    .json(
        new ApiResponse(200,
            {
            user : loggedInUser,AccesToken,RefreshToken
            },
            "User Logged In Successfully !!!!"
        )
    )

})


const logoutUser = asyncHandler(async(req,res) => {
    
})


export {registerUser}