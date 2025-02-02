import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user.id; // Assuming user is authenticated and ID is in the token

    if (!isValidObjectId(channelId)) {
        return apiError(res, 400, "Invalid channel ID.");
    }

    // Check if the user is already subscribed to the channel
    const existingSubscription = await Subscription.findOne({ user: userId, channel: channelId });

    if (existingSubscription) {
        // Unsubscribe
        await existingSubscription.remove();
        return apiResponse(res, 200, "Successfully unsubscribed from the channel.");
    }

    // Subscribe to the channel
    const newSubscription = new Subscription({
        user: userId,
        channel: channelId,
    });

    await newSubscription.save();

    return apiResponse(res, 201, "Successfully subscribed to the channel.");
});

// Controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        return apiError(res, 400, "Invalid channel ID.");
    }

    const subscribers = await Subscription.find({ channel: channelId }).populate("user", "username email");

    if (!subscribers.length) {
        return apiResponse(res, 404, "No subscribers found for this channel.");
    }

    return apiResponse(res, 200, "Subscribers retrieved successfully.", subscribers);
});

// Controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        return apiError(res, 400, "Invalid subscriber ID.");
    }

    const subscriptions = await Subscription.find({ user: subscriberId }).populate("channel", "channelName channelDescription");

    if (!subscriptions.length) {
        return apiResponse(res, 404, "No subscribed channels found.");
    }

    return apiResponse(res, 200, "Subscribed channels retrieved successfully.", subscriptions);
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
