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

    /**
     * Nghiệp vụ Làm mới Token
     */
    async refresh(refreshToken: string) {
      try {
        // Verify và decrypt refresh token
        const payload = JWT.verifyRefreshToken(refreshToken);
        
        // Lấy user từ database
        const user = await User.findById(payload.id);
        if (!user) {
          const error = new Error('User not found');
          (error as any).statusCode = 401;
          throw error;
        }

        // Generate new tokens
        const newPayload = { 
          id: user._id.toString(), 
          isGuest: user.isGuest 
        };
        
        return {
          accessToken: JWT.generateAccessToken(newPayload),
          refreshToken: JWT.generateRefreshToken(newPayload)
        };
      } catch (error: any) {
        const statusCode = error.statusCode || 401;
        const message = error.message || 'Invalid refresh token';
        const err = new Error(message);
        (err as any).statusCode = statusCode;
        throw err;
      }
    }
  }
  
  export const authService = new AuthService();
