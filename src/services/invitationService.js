const { BoardModal } = require("@/models/BoardModel");
const { invitationModel } = require("@/models/invitationModel");
const { userModel } = require("@/models/UserModel");
const ApiError = require("@/utils/ApiError");
const {
  INVITATION_TYPES,
  BOARD_INVITATION_STATUS,
} = require("@/utils/constant");
const { pickUser } = require("@/utils/formatters");
const { StatusCodes } = require("http-status-codes");

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // 🧑 Người đi mời: chính là người đang request, nên chúng ta tìm theo id lấy từ token
    const inviter = await userModel.findOneById(inviterId);

    // 👤 Người được mời: lấy theo email mà nhập từ phía FE
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail);

    // 🧩 Tìm luôn cái board ra để xử lý sau này
    const board = await BoardModal.findOneById(reqBody.boardId);

    // 🛑 Nếu không tồn tại 1 trong 3 thì chúng ta tay reject
    if (!invitee || !inviter || !board) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Inviter, Invitee or Board not found!"
      );
    }

    // ✅ Tạo data cần thiết để lưu vào trong DB
    // Có thể thử bỏ bớt 1 trường để test lệch type, boardInvitation, status để test xem Model validate ok chưa.
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), // chuyển từ ObjectId về String vì sang bên Model có check lại data ở hàm create
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING, // Default ban đầu trạng thái là pendding
      },
      // status: BOARD_INVITATION_STATUS.PENDING,
    };

    // 📥 Gọi sang Model để lưu vào DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(
      newInvitationData
    );

    // 📤 Sau khi tạo thì lấy lại dữ liệu vừa tạo
    const getInvitation = await invitationModel.findOneById(
      createdInvitation.insertedId.toString()
    );

    // 🧾 Ngoài thông tin của cái board invitation mới tạo thì trả về đủ cả luôn board, inviter, invitee cho FE thoải mái xử lý.
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee),
    };

    return resInvitation;
  } catch (error) {
    throw error;
  }
};

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId);
    // Vì các dữ liệu board ,invitee ,inviter đang là mảng 1 phần từ và không có trường hợp sẽ chứa nhiều phần tử
    // Nên chúng ta sẽ biến đổi nó thành Json Oject rồi mới trả về cho FE
    const resInvitations = getInvitations.map((i) => ({
      ...i,
      invitee: i.invitee[0] || {},
      inviter: i.inviter[0] || {},
      board: i.board[0] || {},
    }));
    return resInvitations;
  } catch (error) {
    throw error;
  }
};

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    const getInvitation = await invitationModel.findOneById(invitationId);
    if (!getInvitation)
      throw new ApiError(StatusCodes.NOT_FOUND, "Invitation Not Found!");
    const boardId = getInvitation.boardInvitation.boardId;
    const getBoard = await BoardModal.findOneById(boardId.toString());
    if (!getBoard)
      throw new ApiError(StatusCodes.NOT_FOUND, "Board Not Found!");
    //  Kiểm tra xem user đã là owner hay member của board hay chưa

    const boardOwnerAndMemberIds = [
      ...getBoard.ownerIds,
      ...getBoard.memberIds,
    ].toString(); // Hoặc dùng concat() để nối mảng
    if (
      status === BOARD_INVITATION_STATUS.ACCEPTED &&
      boardOwnerAndMemberIds.includes(userId)
    ) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "You are already a member of this board!"
      );
    }
    // Tạo dữ liệu đẻ update bản ghi invitation
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        boardId: boardId.toString(), // Chuyển sang string trước khi gửi qua model xử lí
        status: status, // Accepted hoặc Rejected do FE gửi lên
      },
    };
    //  B1: Cập nhật lại bản ghi trong invitation
    const updatedInvitation = await invitationModel.update(
      invitationId,
      updateData
    );
    console.log(
      "🚀 ~ updateBoardInvitation ~ updatedInvitation.boardInvitation.status:",
      updatedInvitation.boardInvitation.status
    );
    // B2: Nếu Accept một lời mời thành công thì thêm userId của user được mười vào memberId trong board
    if (
      updatedInvitation.boardInvitation.status ===
      BOARD_INVITATION_STATUS.ACCEPTED
    ) {
      await BoardModal.pushMemberIds(boardId.toString(), userId);
    }

    return updatedInvitation;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  invitationService: {
    createNewBoardInvitation,
    getInvitations,
    updateBoardInvitation,
  },
};
