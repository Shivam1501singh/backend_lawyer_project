import express from 'express';
import { getPracticeAreas } from '../controllers/master.controller.js';

const router = express.Router();

router.get('/', getPracticeAreas);

export default router;
