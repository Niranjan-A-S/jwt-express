import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const port = process.env.AUTH_SERVER_PORT || 4000;

const app = express();
app.use(express.json());

let refreshTokens = [];

app.post('/login', (req, res) => {
    //Authenticate the user

    const username = req.body.username;
    if (!username) return res.sendStatus(204);
    const user = { username };
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.status(200).json({ accessToken, refreshToken });
});

app.post('/token', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken({ username: user.username });
        res.json({ accessToken });
    });
});

app.delete('/logout', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.sendStatus(204);
})

app.listen(port, () => {
    console.log('Listening on port ' + port);
})


function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}