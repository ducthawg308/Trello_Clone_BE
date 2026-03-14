import JWT from 'jsonwebtoken'

// Function tạo mới một token cần 3 tham số đầu vào:
// 1. userInfo: Những thông tin muốn đính kèm vào token
// 2. secretSignature: Chữ ký bí mật (dạng một chuỗi string ngẫu nhiên)
// 3. tokenLife: Thời gian sống của token
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

// Function kiểm tra một token có hợp lệ hay không
// Hợp lệ ở đây hiểu đơn giản là cái token được tạo ra có đúng với cái chữ ký bí mật secretSignature trong dự án hay không
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}