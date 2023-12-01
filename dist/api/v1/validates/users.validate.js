"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.otpPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const user_model_1 = __importDefault(require("../../../models/user.model"));
const forgot_password_model_1 = __importDefault(require("../../../models/forgot-password.model"));
function validatePassword(password) {
    if (password.length < 8) {
        return false;
    }
    if (!/[A-Z]/.test(password)) {
        return false;
    }
    if (!/[a-z]/.test(password)) {
        return false;
    }
    if (!/[$@$!%*?&.]/.test(password)) {
        return false;
    }
    return true;
}
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
const register = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!validateEmail(req.body.email)) {
            res.status(401).json({ error: "Email Không Hợp Lệ" });
            return;
        }
        const checkEmail = yield user_model_1.default.findOne({
            email: req.body.email,
            deleted: false
        });
        if (checkEmail) {
            res.status(401).json({ error: "Email Đã Tồn Tại!" });
            return;
        }
        if (!validatePassword(req.body.password)) {
            res.status(401).json({ error: "Mật Khẩu Bạn Nhập Không Hợp Lệ Tối Thiểu 8 Kí Tự,1 Ký Tự Đặc Biệt Và Một Chữ Viết Hoa!" });
            return;
        }
        if (!req.body.fullName) {
            res.status(401).json({ error: "Vui Lòng Nhập Tên!" });
            return;
        }
        next();
    });
};
exports.register = register;
const login = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!validateEmail(req.body.email)) {
            res.status(401).json({ error: "Email Không Hợp Lệ" });
            return;
        }
        if (!req.body.password) {
            res.status(401).json({ error: "Vui Lòng Nhập Mật Khẩu!" });
            return;
        }
        next();
    });
};
exports.login = login;
const forgotPassword = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const email = req.body.email;
        if (!validateEmail(email)) {
            res.status(401).json({ error: "Email Không Hợp Lệ" });
            return;
        }
        const record = yield forgot_password_model_1.default.findOne({
            email: email
        });
        if (record) {
            const dateObject = new Date(record.timeWait);
            const currentDate = new Date();
            const timeDifference = currentDate.getTime() - dateObject.getTime();
            const minutesDifference = Math.ceil(timeDifference / (1000));
            if (minutesDifference < 60) {
                res.status(401).json({ error: `Bạn Không Được Gửi Quá Nhanh Hãy Gửi Lại Sau ${60 - minutesDifference}!` });
                return;
            }
        }
        next();
    });
};
exports.forgotPassword = forgotPassword;
const otpPassword = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const record = yield forgot_password_model_1.default.findOne({
            email: req.body.email,
        });
        if (!record) {
            res.status(401).json({ error: "Email Này Chưa Được Gửi Otp Vui Lòng Gửi Otp Rồi Thử Lại!" });
            return;
        }
        if (!validateEmail(req.body.email)) {
            res.status(401).json({ error: "Email Không Hợp Lệ" });
            return;
        }
        if (!req.body.otp) {
            res.status(401).json({ error: "Vui Lòng Nhập Otp!" });
            return;
        }
        next();
    });
};
exports.otpPassword = otpPassword;
const resetPassword = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.body.password) {
            res.status(401).json({ error: "Vui Lòng Không Để Trống Mật Khẩu!" });
            return;
        }
        if (!validatePassword(req.body.password)) {
            res.status(401).json({ error: "Mật Khẩu Bạn Nhập Không Hợp Lệ Tối Thiểu 8 Kí Tự,1 Ký Tự Đặc Biệt Và Một Chữ Viết Hoa!" });
            return;
        }
        next();
    });
};
exports.resetPassword = resetPassword;
