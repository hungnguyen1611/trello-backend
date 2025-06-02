// Params socket sẽ được lấy từ thư viện socket
const inviUserToBoardSocket = (socket) => {
  // Lắng nghe sự kiện mà client emit lên có tên là: FE_USER_INVITED_TO_BOARD
  socket.on("FE_USER_INVITED_TO_BOARD", (invitation) => {
    // Cách làm nhanh và đơn giản nhất: Emit ngược lại một sự kiện về cho mọi client khác (ngoại trừ chính thằng gửi request lên),
    //  rồi để phía FE check
    // broadcast  emit về ngoại trừ thằng phát ra sự kiện
    socket.broadcast.emit("BE_USER_INVITED_TO_BOARD", invitation);
  });
};

module.exports = inviUserToBoardSocket;
