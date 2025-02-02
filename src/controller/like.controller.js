import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleLike = async (req, res, type, id) => {
    if (!isValidObjectId(id)) {
        throw new apiError(400, "Invalid ID");
    }

    const existingLike = await Like.findOne({ user: req.user._id, targetId: id, type });
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        res.status(200).json(new apiResponse(200, null, `${type} like removed successfully`));
    } else {
        const like = new Like({ user: req.user._id, targetId: id, type });
        await like.save();
        res.status(201).json(new apiResponse(201, like, `${type} liked successfully`));
    }
};

const toggleVideoLike = asyncHandler(async (req, res) => {
    await toggleLike(req, res, "video", req.params.videoId);
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    await toggleLike(req, res, "comment", req.params.commentId);
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    await toggleLike(req, res, "tweet", req.params.tweetId);
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.find({ user: req.user._id, type: "video" }).populate("targetId");
    res.status(200).json(new apiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
