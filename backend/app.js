const express = require("express");

const app = express();

app.use('/api/posts', (req, res, next) => {
    const posts = [
        {
            id: 'fadfadsf1',
            title: 'First server-side post',
            content: 'This is coming from the server'
        }
        , {
            id: 'fadfadsf2',
            title: 'Second server-side post',
            content: 'This is coming from the server!!!'
        }
    ];

    res.status(200).json({message: 'Posts fetched successfully!', posts: posts});
});

module.exports = app;