import express from 'express';
import { addKeyword, getAllKeywords } from '../controllers/rankController.js';

const router = express.Router();

router.post('/add', addKeyword);
router.get('/', getAllKeywords);
router.get('/list', getAllKeywords); // <--- ADD THIS LINE to stop the 404 error

export default router;