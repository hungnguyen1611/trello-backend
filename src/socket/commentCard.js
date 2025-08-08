const commentCard = (socket) => {
  socket.on("joinCard", (cardId) => {
    socket.join(cardId);
  });
  socket.on("FE_COMMENT_CARD", (data) => {
    const { cardId } = data;
    socket.to(cardId).emit("BE_COMMENT_CARD", data.comment);
  });
};

module.exports = commentCard;
