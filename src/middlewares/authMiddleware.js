import { StatusCodes } from 'http-status-codes'
import { env } from '../config/environment.js'
import { JwtProvider } from '../providers/JwtProvider.js'
import ApiError from '../utils/ApiError.js'

// Middleware này sẽ đảm nhiệm việc xác thực cái JWT accessToken nhân được từ FE có hợp lệ hay không
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken nằm trong request cookies phí Client (withCredentials)
  const clientAccessToken = req.cookies?.accessToken

  // Nếu như clientAccessToken không tồn tại thì trả về lỗi luôn
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
    return
  }

  try {
    // 1. Thực hiện giải mã token xem nó có hợp lệ hay không
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    // 2. Nếu như token hợp lệ, thì cần phải lưu thông tin giải mã được vào req.jwtDecoded, để sử dụng cho các tầng xử lý ở phía sau
    req.jwtDecoded = accessTokenDecoded
    // 3. Cho request đi tiếp
    next()
  } catch (error) {
    // Nếu accessToken bị hết hạn thì trả về mã lỗi GONE - 410 cho FE biết để gọi api refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
      return
    }
    // Nếu accessToken không hợp lệ với bất kỳ lý do nào khác ngoại trừ accessToken hết hạn, thì trả về mã lỗi 401 cho FE gọi API logout luôn
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = { isAuthorized }