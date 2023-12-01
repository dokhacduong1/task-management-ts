import { generateRandomNumber, generateRandomString } from "../../../helpers/generateString";
import { Request, Response } from "express";
import md5 from "md5"
import User from "../../../models/user.model";
import { InfoUser } from "../Interface/user.interface";
import ForgotPassword from "../../../models/forgot-password.model";
import { sendMail } from "../../../helpers/sendMail";
// [POST] /api/v1/users/register
export const register =  async function (req: Request, res: Response): Promise<void> {
    try {
        //Lấy info người dùng gửi lên xong lưu vào object infoUser
        const infoUser : InfoUser = {
            fullName: req.body.fullName,
            email: req.body.email,
            password: md5(req.body.password),
            token: generateRandomString(30),

        }
        //Lưu tài khoản vừa tạo vào database
        const user = new User(infoUser);
        await user.save();

        //Lưu token vừa tạo vào cookie
        const token : string = user.token;
        res.cookie("token", token);
        res.status(200).json({ success: "Tạo Tài Khoản Thành Công!", token: token });
    } catch (error) {
        //Thông báo lỗi 500 đến người dùng server lỗi.
        console.error("Error in API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }


}


// [POST] /api/v1/users/login
export const login = async function (req: Request, res: Response): Promise<void> {
    try {
        //Lấy email ,password người dùng gửi lên
        const email : string = req.body.email;
        const password : string = req.body.password;
        //Check xem trong databse có tồn tại email và mật khẩu có đúng hay không!
        const user = await User.findOne({
            email: email,
            password: md5(password)
        })
        //Nếu không đúng thì return tài khoản mật khẩu ko đúng
        if (!user) {
             res.status(401).json({ error: "Tài Khoản Hoặc Mật Khẩu Không Đúng!" });
             return;
        }
        //Lấy ra token lưu vào cookie
        const token : string = user.token;
        res.cookie("token", token);
        res.status(200).json({ success: "Đăng Nhập Thành Công!", token: token });
    } catch (error) {
        //Thông báo lỗi 500 đến người dùng server lỗi.
        console.error("Error in API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

}
// [POST] /api/v1/users/password/forgot
export const forgotPassword = async function (req: Request, res: Response): Promise<void> {
    try {
        //Lấy Email khi người dùng gửi lên
        const email : string = req.body.email;
        //Check email này có trong database hay không
        const user = await User.findOne({
            email: email,
            deleted: false,
        })
        //Nếu không đúng thì return tài khoản ko đúng
        if (!user) {
             res.status(401).json({ error: "Tài Khoản Không Đúng!" });
             return;
        }

        //Set time cho bản ghi "5" phút sẽ tự xóa
        const timeExpire : number = 4;
        const expireAtOk : Date = new Date();
        //Đoạn này setMiniutes là 5 phút cho biên expireAtOk vừa tạo
        expireAtOk.setMinutes(expireAtOk.getMinutes() + timeExpire);
        // Tạo ra một ãm OTP 6 số và Gàn hết thông tin vào objectForgotPassword 
        const objectForgotPassword = {
            email: email,
            otp: generateRandomNumber(6),
            expireAt: expireAtOk,
            timeWait: new Date(new Date().getTime() + 60)
        }

        //Xem email đã tồn tại trong database hay chưa
        const checkRecord = await ForgotPassword.findOne({
            email: email
        })
        //Tạo một biến otp để lưu otp
        let otp : string;
        //Nếu bản ghi tồn tại và qua 60s trong validate rồi thì ta cho người dùng một otp mới,điều đơn giản chỉ là updte cái otp cũ
        if (checkRecord) {
            await ForgotPassword.updateOne({
                email: email
            }, objectForgotPassword)
            otp = objectForgotPassword.otp
        }//Nếu chưa có bản ghi nào tồn tại ta tạo otp mới cho người dùng
        else {
            //Lưu vào database
            const record = new ForgotPassword(objectForgotPassword);
            await record.save();
            otp = record.otp
        }

        //Mấy đoạn dưới dài như này là html css cái form gửi otp về
        const subject : string = "Mã OTP xác minh lấy lại mật khẩu";

        //Bắt đầu gửi mail bằng hàm sendMail này
        sendMail(email, subject, otp);
        res.status(200).json({ success: `Gửi Otp Thành Công Đến Email ${email}` });
    } catch (error) {
        //Thông báo lỗi 500 đến người dùng server lỗi.
        console.error("Error in API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

}

// [POST] /api/v1/users/password/otp
export const otpPassword = async function (req: Request, res: Response): Promise<void> {
    try {
        //Lấy thông tin người dùng gửi lên
        const email : string = req.body.email;
        const otp : string = req.body.otp;
        //Check dữ vào database dữ liệu người dùng gửi lên
        const record = await ForgotPassword.findOne({
            email: email,
            otp: otp
        })
        //nếu check mà record không có trong database là otp không hợp lệ
        if (!record) {
             res.status(401).json({ error: "Otp Không Hợp Lệ!" });
             return;
        }
        //Nếu đúng thì truy cập vào bảng user để lấy token xong gán vào cookie
        const user = await User.findOne({ email: email });
        res.cookie("token", user.token);
        res.status(200).json({ success: `Xác Thực Otp Thành Công!` });
    } catch (error) {
        //Thông báo lỗi 500 đến người dùng server lỗi.
        console.error("Error in API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

}

// [POST] /api/v1/users/password/reset
export const resetPassword = async function (req: Request, res: Response): Promise<void> {
    try {
        //Lấy thông tin người dùng gửi lên
        const token : string = req.body.token;
        const password : string = req.body.password;
        //lấy thông tin người dùng bằng token
        const user = await User.findOne({
            token: token,
            deleted: false,
        })
        //Nếu user không có thì in ra tài khoản không hợp lệ
        if (!user) {
             res.status(401).json({ error: "Tài Khoản Không Hợp Lệ!" });
             return;
        }
        //Tạo một token mới
        const tokenNew : string = generateRandomString(30)
        //Nếu hợp lệ thì update mật khẩu cho user
        await User.updateOne({ token: token }, {
            password: md5(password),
            token: tokenNew,
        })
        res.cookie("token", tokenNew);
        res.status(200).json({ success: `Đổi Mật Khẩu Thành Công!` });
    } catch (error) {
        //Thông báo lỗi 500 đến người dùng server lỗi.
        console.error("Error in API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// [POST] /api/v1/users/detail
export const detail = async function (req: Request, res: Response): Promise<void> {
    //lấy ra ra req.user được lưu ở middlewares auth
    const user = req["user"];
    //gán dữ liệu user vào info
    res.status(200).json({ success: `Thành Công!`, info:user });
}

// [POST] /api/v1/users/list
export const list = async function (req: Request, res: Response): Promise<void> {
    //Lâý danh sách list tất cả user để truyền ra api
    const user = await User.find({
        deleted:false
    }).select("fullName email");
    res.status(200).json({ success: `Thành Công!`,user:user});
}