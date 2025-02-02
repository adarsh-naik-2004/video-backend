import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    res.status(200).json(new apiResponse(200, comments, "Video comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { text } = req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }
    if (!text) {
        throw new apiError(400, "Comment text is required");
    }

    const comment = new Comment({ video: videoId, text, user: req.user._id });
    await comment.save();

    res.status(201).json(new apiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid comment ID");
    }
    if (!text) {
        throw new apiError(400, "Updated text is required");
    }

    const comment = await Comment.findByIdAndUpdate(commentId, { text }, { new: true, runValidators: true });
    if (!comment) {
        throw new apiError(404, "Comment not found");
    }

    res.status(200).json(new apiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
        throw new apiError(404, "Comment not found");
    }

    res.status(200).json(new apiResponse(200, comment, "Comment deleted successfully"));
});

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
};
