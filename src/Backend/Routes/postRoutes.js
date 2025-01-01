import Post from "../Models/Post.js";
import User from "../Models/User.js";
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// First, let's index the publicPostID field
const createIndexes = async () => {
    try {
        const indexName = 'idxPosts_publicPostID';
        const existingIndexes = await mongoose.connection.collection('posts').indexExists(indexName);
        if (!existingIndexes) {
            await mongoose.connection.collection('posts').createIndex(
                { publicPostID: 1 },
                { background: true, name: indexName } // background: true makes the index creation non-blocking
            );
            console.log(`Index "${indexName}" created successfully!`);
        }

        const indexName2 = 'idxPosts_owner';
        const existingIndexes2 = await mongoose.connection.collection('posts').indexExists(indexName2);
        if (!existingIndexes2) {
            await mongoose.connection.collection('posts').createIndex(
                { owner: 1 },
                { background: true, name: indexName2 }
            );
            console.log(`Index "${indexName2}" created successfully!`);
        }

        const indexName3 = 'idxPosts_likes';
        const existingIndexes3 = await mongoose.connection.collection('posts').indexExists(indexName3);
        if (!existingIndexes3) {
            await mongoose.connection.collection('posts').createIndex(
                { likes: 1 },
                { background: true, name: indexName3 }
            );
            console.log(`Index "${indexName3}" created successfully!`);
        }

        const indexName4 = 'idxPosts_comments';
        const existingIndexes4 = await mongoose.connection.collection('posts').indexExists(indexName4);
        if (!existingIndexes4) {
            await mongoose.connection.collection('posts').createIndex(
                { comments: 1 },
                { background: true, name: indexName4 }
            );
            console.log(`Index "${indexName4}" created successfully!`);
        }

        const indexName5 = 'idxPosts_comments_likes';
        const existingIndexes5 = await mongoose.connection.collection('posts').indexExists(indexName5);
        if (!existingIndexes5) {
            await mongoose.connection.collection('posts').createIndex(
                { 'comments.likes': 1 },
                { background: true, name: indexName5 }
            );
            console.log(`Index "${indexName5}" created successfully!`);
        }
    }
    
    catch (error) {
        console.error('Error creating index:', error);
    }
};
createIndexes();

// Create a post
router.post("/create", async (req, res) => {
    try {
        const { content, attachment, owner } = req.body;
        const newPost = new Post({ content, attachment, owner });
        newPost.likes.push(owner);
        await newPost.save();

        const user = await User.findById(owner);
        user.postsPublished.push(newPost._id);
        user.likedPosts.push(newPost._id);
        await user.save();
        
        res.status(201).send(newPost);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Delete a post
router.post("/delete", async (req, res) => {
    try {
        const { postID, userID } = req.body;
        const post = await Post.findById(postID);
        if (!post) return res.status(404).send("Post not found");

        if (post.owner === userID || userID === "admin") {
            await Post.findByIdAndDelete(postID);
            const user = await User.findById(userID);
            user.posts = user.posts.filter((post) => post !== postID);
            await user.save();

           for (const userElement of post.likes) {
                userElement.likedPosts = userElement.likedPosts.filter((post) => post !== postID);
                await userElement.save();
            }

            res.status(200).send("Post deleted successfully");
        } 
        
        else {
            res.status(403).send("You do not have permission to delete this post");
        }
    }

    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Comment on a post
router.post("/comment", async (req, res) => {
    try {
        const { postID, commenter, content } = req.body;
        const post = await Post.findById(postID);
        if (!post) return res.status(404).send("Post not found");

        post.comments.push({ commenter, content });
        await post.save();

        res.status(201).send(post);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Load the 10 most popular posts
router.get("/popular", async (req, res) => {
    try {
        const posts = await Post.find().sort({ likes: -1 }).limit(10).populate("owner", "username profilePicture");
        res.status(200).send(posts);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Load every post from a user
router.get("/user/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send("User not found");

        const posts = await Post.find({ owner: user._id }).populate("owner", "username displayName profilePicture");
        res.status(200).send(posts);
    }

    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Like a post
router.post("/like", async (req, res) => {
    try {
        const { postID, userID } = req.body;

        const post = await Post.findById(postID);
        if (!post) return res.status(404).send("Post not found");

        const user = await User.findById(userID);

        if (!user.likedPosts.some((id) => id.toString() === postID)) {
            user.likedPosts.push(postID);
            await user.save();

            post.likes.push(userID);
            await post.save();

            res.status(200).send("Post liked successfully");
        } 
        
        else {
            return res.status(403).send("You have already liked this post");
        }
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error.message || error);
    }
});

// Unlike a post
router.post("/unlike", async (req, res) => {
    try {
        const { postID, userID } = req.body;

        const post = await Post.findById(postID);
        if (!post) return res.status(404).send("Post not found");

        const user = await User.findById(userID);

        user.likedPosts = user.likedPosts.filter((id) => id.toString() !== postID);
        await user.save();

        post.likes = post.likes.filter((id) => id.toString() !== userID);
        await post.save();

        res.status(200).send("Post unliked successfully");
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error.message || error);
    }
});

// Comment on a post
router.post("/comment/publish", async (req, res) => {
    try {
        const { postID, commenter, content } = req.body;
        const post = await Post.findById(postID);
        if (!post) return res.status(404).send("Post not found");

        post.comments.push({ commenter, content });
        await post.save();
        res.status(201).send(post);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Delete a comment
router.post("/comment/delete", async (req, res) => {
    try {
        const { postID, commentID, userID } = req.body;

        const post = await Post.findById(postID);
        if (!post) return res.status(404).send("Post not found");

        const comment = post.comments.id(commentID);
        if (!comment) return res.status(404).send("Comment not found");


        if (comment.commenter.toString() !== userID) {
            return res.status(403).send("You do not have permission to delete this comment");
        }

        post.comments = post.comments.filter((c) => c._id.toString() !== commentID);

        await post.save();

        res.status(200).send(post);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error.message || error);
    }
});

// Like a comment
router.post("/comment/like", async (req, res) => {
    try {
        const { postID, commentID, userID } = req.body;
        const post = await Post.findById(postID);
        if (!post) return res.status(404).send("Post not found");

        const comment = post.comments.id(commentID);
        if (!comment) return res.status(404).send("Comment not found");

        if (!comment.likes.includes(userID)) {
            comment.likes.push(userID);
            await post.save();
        }

        else {
            return res.status(403).send("You have already liked this comment");
        }
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Unlike a comment
router.post("/comment/unlike", async (req, res) => {
    try {
        const { postID, commentID, userID } = req.body;
        const post = await Post.findById(postID);
        if (!post) return res.status(404).send("Post not found");

        const comment = post.comments.id(commentID);
        if (!comment) return res.status(404).send("Comment not found");

        comment.likes = comment.likes.filter((user) => user !== userID);
        await post.save();
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Load the comments of a post
router.get("/comments/:postID", async (req, res) => {
    try {
        const { postID } = req.params;

        const post = await Post.findById(postID).populate({
                path: "comments.commenter",
                select: "username displayName profilePicture",
            }).exec();

        if (!post) return res.status(404).send("Post not found");

        const limitedComments = post.comments.slice(0, 15);

        res.status(200).send(limitedComments);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error.message || error);
    }
});

// Load the 10 most recent posts from a user
router.get('/:username/recent', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send("User not found");

        const posts = await Post.find({ owner: user._id }).sort({ createdAt: -1 }).limit(10).populate("owner", "username profilePicture");
        res.status(200).send(posts);
    }

    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Load a post
router.get("/:username/:publicPostID", async (req, res) => {
    try {
        const { username, publicPostID } = req.params;
        const postID = parseInt(publicPostID);

        const post = await Post.findOne({ publicPostID: postID}).populate("owner", "username displayName profilePicture");
        if (!post) return res.status(404).send("Post not found");

        // If the publicPostID isn't related to the given username, then that said person hasn't posted it, we throw an error
        if (post.owner.username !== username) return res.status(403).json({ error: "This post doesn't exist" });
        res.status(200).send(post);
    }

    catch (error) {
        console.error(error);
        res.status(400).send({ error: "Unable to view the post. Please try again later." });
    }
});

export default router;