import jwt from 'jsonwebtoken';

// Generate Access Token (short lived)
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' } // 15 minutes
  );
};

// Generate Refresh Token (long lived)
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // 7 days
  );
};