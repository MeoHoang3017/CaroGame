/** 
 * Auth Service
 * @description Auth Service is a service that handles authentication operations like login, register, logout, etc.
 * @package services
 * @module AuthService
 * @exports AuthService
 * @exports loginService
 * @exports registerService
 * @exports logoutService
 */

import * as Hasher from "../utils/hasher";
import * as JWT from "../utils/jwt";
import User from "../models/user.model";
import type { UserModel } from "../types/User";

export class AuthService {
    /**
     * Nghiệp vụ Đăng ký
     */
    async register(data: any) {
      const hashedPassword = await Hasher.hashPassword(data.password);

      const newUser = (await User.create({
        ...data,
        password: hashedPassword,
        isGuest: false
      })) as unknown as UserModel;
      
      const payload = { id: newUser.id.toString() as string, isGuest: newUser.isGuest as boolean };
      return {
        user: newUser,
        accessToken: JWT.generateAccessToken(payload),
        refreshToken: JWT.generateRefreshToken(payload)
      };
    }
  
    /**
     * Nghiệp vụ Đăng nhập (Sử dụng hàm match mật khẩu)
     */
    async login(email: string, pass: string) {
      const user = await User.findOne({ email }).select('+password');
      if (!user) throw new Error('Người dùng không tồn tại');
  
      // Sử dụng hàm match mật khẩu từ Hasher Utility
      const isMatch = await Hasher.isMatch(pass, user.password!);
      if (!isMatch) throw new Error('Mật khẩu không chính xác');

      const payload = { id: user._id.toString(), isGuest: user.isGuest };
      return {
        user: { id: user._id, username: user.username, isGuest: user.isGuest },
        accessToken: JWT.generateAccessToken(payload),
        refreshToken: JWT.generateRefreshToken(payload)
      };
    }

    /**
     * Nghiệp vụ Đăng xuất
     */
    async logout(userId: string) {
      await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
    }
  }
  
  export const authService = new AuthService();
