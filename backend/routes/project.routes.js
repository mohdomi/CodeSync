import {Router} from 'express';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router = Router();

const projectSchema = z.object({
    name: z.string().min(1, 'Name is required.')
});

const addUserSchema = z.object({
    projectId: z.string().min(1, 'Project ID is required.'),
    users: z.array(z.string()).min(1, 'At least one user must be provided.')
});

const validateSchema = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            message: error.errors[0].message
        });
    }
};

router.post('/create',
    authMiddleware.authUser,
    validateSchema(projectSchema),
    projectController.createProjectController
);

router.get('/all', 
    authMiddleware.authUser,
    projectController.getAllProject
);

router.put('/add-user',
    authMiddleware.authUser,
    validateSchema(addUserSchema),
    projectController.addUserToProject
);

router.get('/get-project/:projectId',
    authMiddleware.authUser,
    projectController.getProjectById
);

export default router;