import express from 'express';
import { getCourts } from '../controllers/master.controller.js';

const router = express.Router();

router.get('/', getCourts);

export default router;
