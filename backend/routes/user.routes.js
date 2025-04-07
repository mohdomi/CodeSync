import {Router} from 'express';
import * as authMiddleware from '../middleware/auth.middleware.js'
// i am using this * and importing everything as a single module because it gives suggestion so dont need to lookup multiple times
import * as userController from '../controllers/user.controller.js'
import {z} from 'zod';

const router = Router();

const userSchema = z.object({
    email: z.string().email('Email must be a valid email.'),
    password: z.string().min(6, 'Password must be at least 6 characters long')
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

router.post('/register',
    validateSchema(userSchema),
    userController.createUserController
);

router.post('/login',
    validateSchema(userSchema),
    userController.loginController
);

router.get('/profile', authMiddleware.authUser, userController.profileController);

router.get('/logout', userController.logoutController);

router.get('/all', authMiddleware.authUser, userController.getAllUsers);

export default router;