import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!mongoose.isValidObjectId(channelId)) {
        throw new apiError(400, "Invalid channel ID");
    }

    const totalVideos = await Video.countDocuments({ channel: channelId });
    const totalViewsData = await Video.aggregate([
        { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });
    const totalLikes = await Like.countDocuments({ channel: channelId });

    res.status(200).json(new apiResponse(200, {
        totalVideos,
        totalViews: totalViewsData.length ? totalViewsData[0].totalViews : 0,
        totalSubscribers,
        totalLikes
    }, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!mongoose.isValidObjectId(channelId)) {
        throw new apiError(400, "Invalid channel ID");
    }

    const videos = await Video.find({ channel: channelId }).sort({ createdAt: -1 });
    res.status(200).json(new apiResponse(200, videos, "Channel videos fetched successfully"));
});

export {
    getChannelStats, 
    getChannelVideos
};
