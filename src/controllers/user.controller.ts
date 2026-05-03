import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { User } from "../models/user.model";
import { uploadToCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/apiResponse";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { IUserDocument } from "../types/user.types";

/**
 * Multer files shape when using upload.fields()
 */
interface MulterFiles {
    [fieldname: string]: Express.Multer.File[];
}

const generateAccessAndRefreshTokens = async (
    userId: mongoose.Types.ObjectId
): Promise<{ accessToken: string; refreshToken: string }> => {
    // find user
    // generate access and refresh tokens
    // update refresh token
    // save user
    // return access and refresh tokens

    try {
        const user = (await User.findById(userId)) as IUserDocument;
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        // When you try to save the document, Mongoose will validate the document according to the schema
        // before saving it to the database so it will ask for everything that is required in the schema
        // but we just want to update the refresh token so we set validateBeforeSave to false
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    //! logics to register user
    // get data from req.body / frontend
    // validation (check if not empty)
    // Check if user already exists
    // Check for images, check for avatar
    // upload them to cloudinary, and check for avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    //todo get data from req.body / frontend
    const { username, fullName, email, password } = req.body;

    //todo validation (check if not empty)
    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    //todo Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existedUser) {
        throw new ApiError(
            409,
            `User with email: ${email} or username: ${username} already exists`
        );
    }

    //todo Check for images, check for avatar
    const files = req.files as MulterFiles | undefined;
    const avatarLocalPath = files?.avatar?.[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath: string | undefined;
    if (
        files &&
        Array.isArray(files.coverImage) &&
        files.coverImage.length > 0
    ) {
        coverImageLocalPath = files.coverImage[0]?.path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    //todo upload them to cloudinary and check for avatar
    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Something went wrong while uploading avatar");
    }

    //todo create user object - create entry in db and check user creation
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password,
    });

    //todo remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    //todo check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }

    //todo return response
    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    //! logics to login user
    // get data from req.body / frontend
    // validation (check if not empty)
    // find the user with and check for user
    // check if the password is matched and check for password
    // create a access and refresh token
    // send cookies and response

    //todo get data from req.body / frontend
    const { email, username, password } = req.body;

    //todo validation (check if not empty)
    if (!(email || username)) {
        throw new ApiError(400, "username or email is required");
    }

    //todo find the user with and check for user
    const user = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    //todo check if the password is matched and check for password
    //? this user is the one who is trying to login and you have taken it's
    //?  instance from the database here it is the user not the User.
    const isPasswordValid = await (user as IUserDocument).isPasswordCorrect(
        password
    );

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect");
    }

    //todo create access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id as mongoose.Types.ObjectId
    );

    //todo send cookies and response
    // we need to find the user again because the user we found above doesn't have the
    //  access adn refresh token. So here you can update the found user or make another database call.
    //  In such a situation we need to consider the cost of database call the decide which one to use.
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    // verifyJWT middleware will verify the user exists or not in our database and will add user to req.user
    await User.findByIdAndUpdate(
        req.user!._id,
        {
            // $set: { refreshToken: undefined },
            $unset: {
                refreshToken: 1, // this removes the field from document
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
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        ) as JwtPayload;

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(
                user._id as mongoose.Types.ObjectId
            );

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error: any) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(
    async (req: Request, res: Response) => {
        const { oldPassword, newPassword } = req.body;

        // we can get user in req.user because when the a user is trying to change password that means
        // he is logged in and the verifyJWT middleware will add the user to req.user while logging.
        // const user = req.user?.id;

        const user = (await User.findById(req.user?._id)) as IUserDocument;
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

        if (!isPasswordCorrect)
            throw new ApiError(401, "Password is incorrect");

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password changed successfully"));
    }
);

const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User found"));
});

const updateAccountDetails = asyncHandler(
    async (req: Request, res: Response) => {
        const { fullName, email } = req.body;

        if (!(fullName || email))
            throw new ApiError(400, "All fields are required");

        const user = await User.findByIdAndUpdate(
            req.user!._id,
            {
                $set: {
                    fullName: fullName,
                    email: email,
                },
            },
            { new: true }
        ).select("-password");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    "Account details updated successfully"
                )
            );
    }
);

const updateUserAvatar = asyncHandler(async (req: Request, res: Response) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is missing");

    //TODO: delete old image - assignment
    const avatar = await uploadToCloudinary(avatarLocalPath);

    if (!avatar?.url)
        throw new ApiError(500, "Error while uploading avatar on cloudinary");

    const user = await User.findByIdAndUpdate(
        req.user!._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req: Request, res: Response) => {
  const CoverImageLocalPath = req.file?.path;

  if (!CoverImageLocalPath)
    throw new ApiError(400, "Cover image file is missing");

  const coverImage = await uploadToCloudinary(CoverImageLocalPath);

  if (!coverImage?.url)
    throw new ApiError(500, "Error while uploading cover image on cloudinary");

  const user = await User.findByIdAndUpdate(
    req.user!._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;
  if (typeof username !== "string" || !username.trim()) throw new ApiError(400, "Username is required");

  const channel = await User.aggregate([
    // Fist stage
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    // Second stage
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    // Third stage
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    // Fourth stage
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribedTo.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    // Fifth stage
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  console.log(channel);

  if (!channel?.length) throw new ApiError(404, "Channel not found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully"),
    );
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
};
