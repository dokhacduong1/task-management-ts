import { tasksRoutes } from "./tasks.routes"
import  { Express } from "express";
import { usersRoutes } from "./users.routes";
import * as authMiddlewares from "../middlewares/auth.middleware"
const routesVersion1 = (app : Express) : void => {
    const version = "/api/v1"
    app.use(version +"/tasks",authMiddlewares.auth,tasksRoutes)
    app.use(version +"/users",usersRoutes)
}
export default routesVersion1