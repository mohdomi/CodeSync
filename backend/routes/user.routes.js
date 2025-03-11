import {Router} from 'express';
import * as authMiddleware from '../middleware/auth.middleware.js'
// i am using this * and importing everything as a single module because it gives suggestion so dont need to lookup multiple times
import * as userController from '../controllers/user.controller.js'
import {body} from 'express-validator';

const router = Router();


router.post('/register' ,
    body('email').isEmail().withMessage('Email must be a valid email.'),
    body('password').isLength({min : 6}).withMessage('Password must be atleast of 6 length.')
    , userController.createUserController);

    router.post('/login' , 
        body('email').isEmail().withMessage('Email must be a valid email.'),
        body('password').isLength({min : 6}).withMessage('Password must be atleast of 6 length.'),
        userController.loginController
    
    );


    router.get('/profile' , authMiddleware.authUser , userController.profileController);

    router.get('/logout' , userController.logoutController);


    router.get('/all' , authMiddleware.authUser ,  userController.getAllUsers);
 
export default router;