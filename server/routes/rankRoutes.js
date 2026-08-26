import express from 'express';
import {
  addKeyword,
  getAllKeywords,
  getKeywordById,
  refreshKeyword,
  deleteKeyword,
  toggleKeyword,
} from '../controllers/rankController.js';

const router = express.Router();

router.get('/', getAllKeywords);
router.get('/list', getAllKeywords);
router.post('/add', addKeyword);
router.get('/:id', getKeywordById);
router.post('/:id/refresh', refreshKeyword);
router.delete('/:id', deleteKeyword);
router.put('/:id/toggle', toggleKeyword);

export default router;