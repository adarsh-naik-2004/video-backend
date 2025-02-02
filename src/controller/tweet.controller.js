import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.user.id; // Assuming user is authenticated and ID is in the token

    if (!content) {
        return apiError(res, 400, "Content is required.");
    }

    const newTweet = new Tweet({
        content,
        user: userId,
    });

    await newTweet.save();

    return apiResponse(res, 201, "Tweet created successfully.", newTweet);
});

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    if (!isValidObjectId(userId)) {
        return apiError(res, 400, "Invalid user ID.");
    }

    const userTweets = await Tweet.find({ user: userId }).sort({ createdAt: -1 });

    if (!userTweets.length) {
        return apiResponse(res, 404, "No tweets found for this user.");
    }

    return apiResponse(res, 200, "Tweets retrieved successfully.", userTweets);
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        return apiError(res, 400, "Invalid tweet ID.");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        return apiError(res, 404, "Tweet not found.");
    }

    if (tweet.user.toString() !== req.user.id) {
        return apiError(res, 403, "You are not authorized to update this tweet.");
    }

    tweet.content = content || tweet.content;

    await tweet.save();

    return apiResponse(res, 200, "Tweet updated successfully.", tweet);
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        return apiError(res, 400, "Invalid tweet ID.");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        return apiError(res, 404, "Tweet not found.");
    }

    if (tweet.user.toString() !== req.user.id) {
        return apiError(res, 403, "You are not authorized to delete this tweet.");
    }

    await tweet.remove();

    return apiResponse(res, 200, "Tweet deleted successfully.");
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
