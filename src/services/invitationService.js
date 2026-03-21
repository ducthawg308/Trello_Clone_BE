import { StatusCodes } from 'http-status-codes'
import { invitationModel } from '../models/invitationModel.js'
import { userModel } from '../models/userModel.js'
import { boardModel } from '../models/boardModel.js'
import ApiError from '../utils/ApiError.js'
import { pickUser } from '../utils/formatters.js'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '../utils/constants.js'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Người đi mời: chính là người đang request, nên chúng ta tìm theo id lấy từ token
    const inviter = await userModel.findOneById(inviterId)
    // Người được mời: lấy theo email nhận từ FE
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    // Tìm luôn cái board ra để lấy data xử lý
    const board = await boardModel.findOneById(reqBody.boardId)

    // Nếu không tồn tại 1 trong 3 thì reject luôn
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
    }

    // Tạo data cần thiết để lưu vào DB
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING // Default là pending
      }
    }

    // Gọi sang model để lưu vào DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

    // Ngoài thông tin của cái board invitation mới tạo thì trả về đủ board, invited, invitee cho FE thoải mái xử lý
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }

    return resInvitation
  } catch (error) {
    throw error
  }
}

const getInvitations = async (userId) => {
  try {
    const invitations = await invitationModel.findByUser(userId)

    // Vì các dữ liêu inviter, invitee và board đang có dạng mảng 1 phần tử nên chúng ta biến đổi về Object trước khi trả cho FE
    return invitations.map(i => ({
      ...i,
      inviter: i.inviter?.[0] ?? {},
      invitee: i.invitee?.[0] ?? {},
      board: i.board?.[0] ?? {}
    }))
  } catch (error) {
    throw error
  }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // Tìm bản ghi invitation trong model
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')

    // Có invitation rồi thì tìm board
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId)
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

    // Kiểm tra xem nếu status là ACCEPTED join board mà cái thằng user invitee đã là owner hoặc member của board rồi thì trả về thông báo lỗi
    // Note: 2 mảng memberIds và ownerIds của board nó đang kiểu dữ liệu ObjectId nên cho nó về String hết để check
    const boardOwnerAndMemberIds = [...getBoard.ownerIds, ... getBoard.memberIds].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board.')
    }

    // Tạo dữ liệu để update bản ghi Invitation
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status
      }
    }

    // B1: Cập nhật status trong bản ghi Invitation
    const updatedInvitation = await invitationModel.update(invitationId, updateData)
    // B2: Nếu trường hợp Accept một lời mời thành công, thì phải thêm userId vào trường memberIds trong board
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId)
    }

    return updatedInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}