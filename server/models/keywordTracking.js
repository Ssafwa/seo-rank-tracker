import mongoose from 'mongoose';

const keywordTrackingSchema = new mongoose.Schema({
    keyword: { type: String, required: true },
    url: { type: String, required: true },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

// Explicitly set the collection name to 'keywordtrackings'
export default mongoose.model('KeywordTracking', keywordTrackingSchema, 'keywordtrackings');