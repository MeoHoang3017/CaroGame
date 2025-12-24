import jwt from 'jsonwebtoken';
import { encryptJson, decryptJson } from './crypto';

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET_KEY || 'access_key';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET_KEY || 'refresh_key';

interface TokenPayload {
  id: string;
  isGuest: boolean;
}

interface EncryptedTokenPayload {
  enc: string;
}

if (!ACCESS_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET_KEY is not defined in environment variables');
}
if (!REFRESH_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET_KEY is not defined in environment variables');
}

/**
 * Encrypts the payload and generates an access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  const encryptedPayload = encryptJson(payload);
  const jwtPayload: EncryptedTokenPayload = { enc: encryptedPayload };
  return jwt.sign(jwtPayload, ACCESS_SECRET, { expiresIn: '15m' });
};

/**
 * Encrypts the payload and generates a refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  const encryptedPayload = encryptJson(payload);
  const jwtPayload: EncryptedTokenPayload = { enc: encryptedPayload };
  return jwt.sign(jwtPayload, REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Verifies and decrypts an access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, ACCESS_SECRET) as EncryptedTokenPayload;
  if (!decoded.enc) {
    throw new Error('Invalid token format: missing encrypted payload');
  }
  return decryptJson(decoded.enc) as TokenPayload;
};

/**
 * Verifies and decrypts a refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, REFRESH_SECRET) as EncryptedTokenPayload;
  if (!decoded.enc) {
    throw new Error('Invalid token format: missing encrypted payload');
  }
  return decryptJson(decoded.enc) as TokenPayload;
};