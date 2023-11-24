import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const port = process.env.SERVER_PORT || 3000;

const posts = [
    {
        username: 'John',
        title: 'Post 1'
    },
    {
        username: 'Jane',
        title: 'Post 2'
    }
]

const app = express();
app.use(express.json());

app.get('/posts', authenticateUser, (req, res) => {
    res.status(200).json(posts.filter(post => post.username === req.user.username));
});

function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    })
}

app.listen(port, () => {
    console.log('Listening on port ' + port);
})