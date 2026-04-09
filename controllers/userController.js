const USER = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const generateTokens = async (userId, res) => {
    const accessToken = jwt.sign(
        { id: userId }, // 1. DER INHALT (Payload)
        process.env.JWT_SECRET, // 2. DAS SIEGEL (Secret Key)
        { expiresIn: "15m" }, // 3. DAS HALTBARKEITSDATUM (Options)
    );
    const refreshToken = crypto.randomBytes(32).toString("hex");

    await RefreshToken.create({
        userId: userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Tage ab jetztiges datum
    });
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", //Nur HTTPS in Production für Render
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60 * 1000, //15 Minuten
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Tage
    });
};
exports.createUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = await USER.create({
            username: username.trim(),
            email: email.trim(),
            password: password,
        });
        await generateTokens(newUser._id, res);
        res.status(201).json({
            message: "User erfolgreich erstellt",
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.authenticateUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await USER.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ error: "Kein User mit dieser E-Mail gefunden" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            await generateTokens(user._id, res);
            res.status(200).json({
                message: "Login erfolgreich",
            });
        } else {
            return res.status(401).json({ error: "Falsches Passwort" });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

    if (!tokenDoc) {
        return res.status(404).json({ error: "Token nicht gefunden" });
    }

    if (tokenDoc.expiresAt <= Date.now()) {
        return res.status(401).json({ error: "Token abgelaufen" });
    }
    const newAccessToken = jwt.sign(
        { id: tokenDoc.userId },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
    );
    await RefreshToken.findByIdAndDelete(tokenDoc._id);
    const newRefreshToken = crypto.randomBytes(32).toString("hex");

    await RefreshToken.create({
        userId: tokenDoc.userId,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Token erfolgreich erneuert" });
};
exports.logoutUser = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            await RefreshToken.findOneAndDelete({ token: refreshToken })
        }
        res.clearCookie('accessToken', { path: "/" })
        res.clearCookie('refreshToken', { path: "/" })

        res.status(200).json({ message: "Erfolgreich abgemeldet" });
    } catch (err) {
        res.status(500).json({ message: "Abmelden fehgelschlagen" })
    }

};
