import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { Post } from "./models/post.model";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});

app.post('/api/posts', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const post = new Post({
            title: req.body.title,
            content: req.body.content
        });

        const savedPost = await post.save();

        res.status(201).json({
            message: 'Post added successfully',
            post: {
                id: savedPost._id,
                title: savedPost.title,
                content: savedPost.content,
                createdAt: savedPost.createdAt,
                updatedAt: savedPost.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to create post',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

app.get('/api/posts', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await Post.find();

        res.status(200).json({
            message: 'Posts fetched successfully!',
            posts: posts.map(post => ({
                id: post._id,
                title: post.title,
                content: post.content,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch posts',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default app;