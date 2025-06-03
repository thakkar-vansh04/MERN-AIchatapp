import {Router} from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';

const router = Router();

router.get('/create', 

    body('name').notEmpty().withMessage('Project name is required'),
    projectController.createProject
);

export default router;