import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";

interface Post {
    id: string;
    title: string;
    content: string;
}

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});

app.post('/api/posts', (req: Request, res: Response, next: NextFunction) => {
    const post = req.body;
    console.log(post);
    res.status(201).json({
        message: 'Post added successfully',
        title: post.title,
        content: post.content
    });
});

app.get('/api/posts', (req: Request, res: Response, next: NextFunction) => {
    const posts: Post[] = [
        {
            id: 'fadfadsf1',
            title: 'First server-side post',
            content: 'This is coming from the server'
        },
        {
            id: 'fadfadsf2',
            title: 'Second server-side post',
            content: 'This is coming from the server!!!'
        }
    ];

    res.status(200).json({ message: 'Posts fetched successfully!', posts: posts });
});

export default app;