import KeywordTracking from "../models/keywordTracking.js";

export const addKeyword = async (req, res) => {
    try {
        const { keyword, url } = req.body;
        const newTracking = await KeywordTracking.create({ keyword, url });
        res.status(201).json({ success: true, data: newTracking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllKeywords = async (req, res) => {
    try {
        const keywords = await KeywordTracking.find({});
        res.status(200).json({ success: true, data: keywords });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};