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
exports.list = exports.detail = exports.resetPassword = exports.otpPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const generateString_1 = require("../../../helpers/generateString");
const md5_1 = __importDefault(require("md5"));
const user_model_1 = __importDefault(require("../../../models/user.model"));
const forgot_password_model_1 = __importDefault(require("../../../models/forgot-password.model"));
const sendMail_1 = require("../../../helpers/sendMail");
const register = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const infoUser = {
                fullName: req.body.fullName,
                email: req.body.email,
                password: (0, md5_1.default)(req.body.password),
                token: (0, generateString_1.generateRandomString)(30),
            };
            const user = new user_model_1.default(infoUser);
            yield user.save();
            const token = user.token;
            res.cookie("token", token);
            res.status(200).json({ success: "Tạo Tài Khoản Thành Công!", token: token });
        }
        catch (error) {
            console.error("Error in API:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
};
exports.register = register;
const login = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const email = req.body.email;
            const password = req.body.password;
            const user = yield user_model_1.default.findOne({
                email: email,
                password: (0, md5_1.default)(password)
            });
            if (!user) {
                res.status(401).json({ error: "Tài Khoản Hoặc Mật Khẩu Không Đúng!" });
                return;
            }
            const token = user.token;
            res.cookie("token", token);
            res.status(200).json({ success: "Đăng Nhập Thành Công!", token: token });
        }
        catch (error) {
            console.error("Error in API:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
};
exports.login = login;
const forgotPassword = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const email = req.body.email;
            const user = yield user_model_1.default.findOne({
                email: email,
                deleted: false,
            });
            if (!user) {
                res.status(401).json({ error: "Tài Khoản Không Đúng!" });
                return;
            }
            const timeExpire = 4;
            const expireAtOk = new Date();
            expireAtOk.setMinutes(expireAtOk.getMinutes() + timeExpire);
            const objectForgotPassword = {
                email: email,
                otp: (0, generateString_1.generateRandomNumber)(6),
                expireAt: expireAtOk,
                timeWait: new Date(new Date().getTime() + 60)
            };
            const checkRecord = yield forgot_password_model_1.default.findOne({
                email: email
            });
            let otp;
            if (checkRecord) {
                yield forgot_password_model_1.default.updateOne({
                    email: email
                }, objectForgotPassword);
                otp = objectForgotPassword.otp;
            }
            else {
                const record = new forgot_password_model_1.default(objectForgotPassword);
                yield record.save();
                otp = record.otp;
            }
            const subject = "Mã OTP xác minh lấy lại mật khẩu";
            (0, sendMail_1.sendMail)(email, subject, otp);
            res.status(200).json({ success: `Gửi Otp Thành Công Đến Email ${email}` });
        }
        catch (error) {
            console.error("Error in API:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
};
exports.forgotPassword = forgotPassword;
const otpPassword = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const email = req.body.email;
            const otp = req.body.otp;
            const record = yield forgot_password_model_1.default.findOne({
                email: email,
                otp: otp
            });
            if (!record) {
                res.status(401).json({ error: "Otp Không Hợp Lệ!" });
                return;
            }
            const user = yield user_model_1.default.findOne({ email: email });
            res.cookie("token", user.token);
            res.status(200).json({ success: `Xác Thực Otp Thành Công!` });
        }
        catch (error) {
            console.error("Error in API:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
};
exports.otpPassword = otpPassword;
const resetPassword = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = req.body.token;
            const password = req.body.password;
            const user = yield user_model_1.default.findOne({
                token: token,
                deleted: false,
            });
            if (!user) {
                res.status(401).json({ error: "Tài Khoản Không Hợp Lệ!" });
                return;
            }
            const tokenNew = (0, generateString_1.generateRandomString)(30);
            yield user_model_1.default.updateOne({ token: token }, {
                password: (0, md5_1.default)(password),
                token: tokenNew,
            });
            res.cookie("token", tokenNew);
            res.status(200).json({ success: `Đổi Mật Khẩu Thành Công!` });
        }
        catch (error) {
            console.error("Error in API:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
};
exports.resetPassword = resetPassword;
const detail = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = req["user"];
        res.status(200).json({ success: `Thành Công!`, info: user });
    });
};
exports.detail = detail;
const list = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield user_model_1.default.find({
            deleted: false
        }).select("fullName email");
        res.status(200).json({ success: `Thành Công!`, user: user });
    });
};
exports.list = list;
