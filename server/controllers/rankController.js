import KeywordTracking from "../models/keywordTracking.js";
import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';

const fallbackFile = path.resolve('server', 'data', 'fallback_keywords.json');
function ensureFallbackDir() {
    const dir = path.dirname(fallbackFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(fallbackFile)) fs.writeFileSync(fallbackFile, JSON.stringify([]));
}

async function readFallback() {
    ensureFallbackDir();
    return JSON.parse(fs.readFileSync(fallbackFile, 'utf8')) || [];
}

async function writeFallback(arr) {
    ensureFallbackDir();
    fs.writeFileSync(fallbackFile, JSON.stringify(arr, null, 2));
}

export const addKeyword = async (req, res) => {
    try {
        const { keyword, url } = req.body;
        // If mongoose not connected, use fallback file so app is usable without DB
        if (mongoose.connection.readyState !== 1) {
            const arr = await readFallback();
            const newEntry = { _id: Date.now().toString(), keyword, url, status: 'pending', createdAt: new Date().toISOString() };
            arr.push(newEntry);
            await writeFallback(arr);
            return res.status(201).json({ success: true, data: newEntry, fallback: true });
        }

        const newTracking = await KeywordTracking.create({ keyword, url });
        res.status(201).json({ success: true, data: newTracking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllKeywords = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const arr = await readFallback();
            return res.status(200).json({ success: true, data: arr, fallback: true });
        }

        const keywords = await KeywordTracking.find({});
        res.status(200).json({ success: true, data: keywords });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};