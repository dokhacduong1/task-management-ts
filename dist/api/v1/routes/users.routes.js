"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoutes = void 0;
const express_1 = require("express");
const controller = __importStar(require("../controllers/users.controller"));
const validates = __importStar(require("../validates/users.validate"));
const authMiddlewares = __importStar(require("../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
router.post('/register', validates.register, controller.register);
router.post('/register', validates.register, controller.register);
router.post('/login', validates.login, controller.login);
router.post('/password/forgot', validates.forgotPassword, controller.forgotPassword);
router.post('/password/otp', validates.otpPassword, controller.otpPassword);
router.post('/password/reset', validates.resetPassword, controller.resetPassword);
router.post('/detail', authMiddlewares.auth, controller.detail);
router.post('/list', authMiddlewares.auth, controller.list);
exports.usersRoutes = router;
