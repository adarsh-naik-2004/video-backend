import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadonCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sortBy ? { [sortBy]: sortType === "desc" ? -1 : 1 } : {},
    };

    const filter = {};
    if (query) filter.title = { $regex: query, $options: "i" };
    if (userId && isValidObjectId(userId)) filter.owner = userId;

    const videos = await Video.paginate(filter, options);

    return res.status(200).json(new apiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const videoFile = req.files?.videoFile[0]?.path;
    const thumbnail = req.files?.thumbnail[0]?.path;

    if (!videoFile || !thumbnail) {
        throw new apiError(400, "Video file and thumbnail are required");
    }

    const videoUploadResponse = await uploadonCloudinary(videoFile);
    const thumbnailUploadResponse = await uploadonCloudinary(thumbnail);

    if (!videoUploadResponse || !thumbnailUploadResponse) {
        throw new apiError(500, "Failed to upload files to Cloudinary");
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoUploadResponse.url,
        thumbnail: thumbnailUploadResponse.url,
        duration: videoUploadResponse.duration,
        owner: req.user._id,
    });

    return res.status(201).json(new apiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    return res.status(200).json(new apiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnail = req.file?.path;

    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (thumbnail) {
        const thumbnailUploadResponse = await uploadonCloudinary(thumbnail);
        if (!thumbnailUploadResponse) {
            throw new apiError(500, "Failed to upload thumbnail");
        }
        updateFields.thumbnail = thumbnailUploadResponse.url;
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId, updateFields, { new: true });

    if (!updatedVideo) {
        throw new apiError(404, "Video not found");
    }

    return res.status(200).json(new apiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new apiError(404, "Video not found");
    }

    return res.status(200).json(new apiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(new apiResponse(200, video, "Publish status toggled successfully"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};