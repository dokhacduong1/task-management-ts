import { Router } from "express";
//Xíu phải tạo file Control mới có file controller này
import * as controller from "../controllers/users.controller";
import * as validates from "../validates/users.validate"
import * as authMiddlewares from "../middlewares/auth.middleware"
const router : Router = Router();

router.post('/register',validates.register,controller.register )
router.post('/register',validates.register,controller.register )
router.post('/login',validates.login,controller.login)
router.post('/password/forgot',validates.forgotPassword,controller.forgotPassword)
router.post('/password/otp',validates.otpPassword,controller.otpPassword)
router.post('/password/reset',validates.resetPassword,controller.resetPassword)
router.post('/detail',authMiddlewares.auth,controller.detail)
router.post('/list',authMiddlewares.auth,controller.list)
export const usersRoutes : Router  = router