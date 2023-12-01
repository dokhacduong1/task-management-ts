

import { Request, Response } from "express";
import User from "../../../models/user.model";
import ForgotPassword from "../../../models/forgot-password.model";
//Hàm này kiểm tra Password
function validatePassword(password : string) : boolean {
    // Ít nhất 8 ký tự
    if (password.length < 8) {
        return false;
    }

    // Ít nhất một chữ cái viết hoa
    if (!/[A-Z]/.test(password)) {
        return false;
    }

    // Ít nhất một chữ cái viết thường
    if (!/[a-z]/.test(password)) {
        return false;
    }



    // Ít nhất một ký tự đặc biệt
    if (!/[$@$!%*?&.]/.test(password)) {
        return false;
    }

    // Mật khẩu hợp lệ nếu vượt qua tất cả các điều kiện
    return true;
}
//Hàm này kiểm tra Email
function validateEmail(email : string) : boolean {
    // Biểu thức chính quy kiểm tra địa chỉ email
    const emailRegex : RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Kiểm tra xem địa chỉ email đáp ứng biểu thức chính quy hay không
    return emailRegex.test(email);
}

export const register =  async function (req: Request, res: Response,next : any): Promise<void> {
    //Kiểm tra xem người dùng nhập email đúng hay không
    if (!validateEmail(req.body.email)) {
         res.status(401).json({ error: "Email Không Hợp Lệ" });
         return;
    }
    //Lọc email trong database
    const checkEmail = await User.findOne({
        email: req.body.email,
        deleted: false
    })

    //Nếu email đã có trong database trả về lỗi
    if (checkEmail) {
         res.status(401).json({ error: "Email Đã Tồn Tại!" });
         return;
    }
    //Kiểm tra xem password có đúng định dạng không
    if (!validatePassword(req.body.password)) {
         res.status(401).json({ error: "Mật Khẩu Bạn Nhập Không Hợp Lệ Tối Thiểu 8 Kí Tự,1 Ký Tự Đặc Biệt Và Một Chữ Viết Hoa!" });
         return;
    }
    //Check xem fullName có rỗng không
    if (!req.body.fullName) {
         res.status(401).json({ error: "Vui Lòng Nhập Tên!" });
         return;
    }
    //Nếu thỏa mãn hết điều kiện thì cho next
    next()

}

export const login = async function (req: Request, res: Response,next : any): Promise<void> {

    //Kiểm tra xem người dùng nhập email đúng hay không
    if (!validateEmail(req.body.email)) {
         res.status(401).json({ error: "Email Không Hợp Lệ" });
         return;
    }

    //Kiểm tra xem người dùng nhập email hay chưa
    if (!req.body.password) {
         res.status(401).json({ error: "Vui Lòng Nhập Mật Khẩu!" });
         return;
    }
    //Nếu thỏa mãn hết điều kiện thì cho next
    next()
}

export const forgotPassword = async function (req: Request, res: Response,next : any): Promise<void> {
    const email : string = req.body.email
    //Kiểm tra xem người dùng nhập email đúng hay không
    if (!validateEmail(email)) {
         res.status(401).json({ error: "Email Không Hợp Lệ" });
         return;
    }
    const record = await ForgotPassword.findOne({
        email: email
    })
    //Check xem nếu người dùng đã gửi phải bắt người dùng đợi
    if (record) {
        //Lấy timeWait lưu trong database để tạo một đối tượng date
        const dateObject : Date = new Date(record.timeWait);
        // Thời điểm hiện tại
        const currentDate : Date = new Date();
        // Tính toán khoảng thời gian giữa hai thời điểm
        const timeDifference : number = currentDate.getTime() - dateObject.getTime();
        // Chuyển đổi khoảng thời gian từ milliseconds sang giây
        const minutesDifference : number = Math.ceil(timeDifference / (1000));

        if (minutesDifference < 60) {
             res.status(401).json({ error: `Bạn Không Được Gửi Quá Nhanh Hãy Gửi Lại Sau ${60 - minutesDifference}!` });
             return;
        }
    }
    next();
}

export const otpPassword = async function (req: Request, res: Response,next : any): Promise<void> {
    const record = await ForgotPassword.findOne({
        email:req.body.email,    
    })
    if(!record){
         res.status(401).json({ error: "Email Này Chưa Được Gửi Otp Vui Lòng Gửi Otp Rồi Thử Lại!" });
         return;
    }
      //Kiểm tra xem người dùng nhập email đúng hay không
      if (!validateEmail(req.body.email)) {
         res.status(401).json({ error: "Email Không Hợp Lệ" });
         return;
    }
    //Kiểm tra xem người dùng nhập otp hay chưa
    if (!req.body.otp) {
         res.status(401).json({ error: "Vui Lòng Nhập Otp!" });
         return;
    }
    next();
}

export const resetPassword = async function (req: Request, res: Response,next : any): Promise<void> {
    if(!req.body.password){
         res.status(401).json({ error: "Vui Lòng Không Để Trống Mật Khẩu!" });
         return;
    }
     //Kiểm tra xem password có đúng định dạng không
     if (!validatePassword(req.body.password)) {
         res.status(401).json({ error: "Mật Khẩu Bạn Nhập Không Hợp Lệ Tối Thiểu 8 Kí Tự,1 Ký Tự Đặc Biệt Và Một Chữ Viết Hoa!" });
         return;
    }
    next();
}