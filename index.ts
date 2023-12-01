import express, { Express } from "express";
import dotenv from "dotenv"
import bodyParser from "body-parser";
import cors from "cors"
//Require các thành phần vừa viết
import * as database from "./config/database"
import routesVersion1 from "./api/v1/routes/index.routes";

//Tạo một đối tượng app
const app: Express = express();

//Cấu hình để nhận data body khi request
app.use(bodyParser.json())
//Cấu hình cors để tên miền nào được truy cập,mặc định không truyền là cho phép tất cả
app.use(cors())

//Nhúng app của routes vào index
routesVersion1(app)
//Import cấu hình file .env
dotenv.config()
//Kết nối vào database
database.connect();

//Lấy port trong file env hoặc ko có mặc định cổng 3000
const port: (number | string) = process.env.PORT || 3000;

//Tạo ra trang 404
app.get("*", (req, res) => {
    res.status(404).json({error:"Api Không Tồn Tại!"});
});


//Express lắng nghe cổng của bạn nó sẽ tạo ra một cổn cho bạn chỉ định
app.listen(port, (): void => {
    console.log(`App Listening On Port ${port}`)
})

