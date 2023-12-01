import {Router } from "express";
import * as validates from "../validates/tasks.validate"
//Xíu phải tạo file Control mới có file controller này
import * as controller from "../controllers/tasks.controller";
const router : Router = Router();
router.get("/",controller.index)
router.get("/detail/:id", controller.detail)
router.patch("/change-status/:id",validates.editStatus, controller.changeStatus);
router.patch("/change-multi", controller.changeMulti);
router.post("/create",validates.create, controller.create);
router.patch("/edit/:id",validates.edit, controller.edit);
router.delete("/delete/:id", controller.deleteTask);
export const tasksRoutes : Router  = router