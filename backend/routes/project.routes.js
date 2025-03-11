import {Router} from 'express';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';
import { body } from 'express-validator';



const router = Router();



router.post('/create',
    authMiddleware.authUser ,
    body('name').isString().withMessage('Name is required.'),
    projectController.createProjectController
)

router.get('/all' , 
    authMiddleware.authUser,
    projectController.getAllProject
)

router.put('/add-user' ,authMiddleware.authUser,
    body('projectId').isString().withMessage("project ID must be a string.") ,

    body('users').isArray({min:1}).withMessage('Users must be array of strings').bail().custom((users) => users.every(user => typeof user ==='string')).withMessage('Each user must be a string'),

    projectController.addUserToProject
)


router.get('/get-project/:projectId',
    authMiddleware.authUser,
    projectController.getProjectById
)


export default router;