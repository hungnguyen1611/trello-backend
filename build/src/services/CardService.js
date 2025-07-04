const {
  BoardModal
} = require("@/models/BoardModel");
const {
  CardModel
} = require("@/models/CardModel");
const {
  ColumnModel
} = require("@/models/ColumnModel");
const {
  CloudinaryProvider
} = require("@/provider/CloudinaryProvider");
const {
  slugify
} = require("@/utils/formatters");
const newCard = async data => {
  try {
    const newData = {
      ...data,
      slug: slugify(data.title)
    };
    const newCard = await CardModel.newCard(newData);
    const getCard = await CardModel.findOneById(newCard.insertedId.toString());

    //  CÓ THỂ TRẢ VỀ BOARD ĐỂ FRONTEND sẽ nhàn hơn
    // const getCard = await BoardModal.getDetail(data.boardId);

    if (getCard) {
      await ColumnModel.pushCardOrderIds(getCard);
    }
    return getCard;
  } catch (error) {
    throw error;
  }
};
const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    let updatetCard;
    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, "card-covers");
      // Lưu lại url vào database
      updatetCard = await CardModel.update(cardId, {
        cover: uploadResult.secure_url,
        updatedAt: Date.now()
      });
    } else if (reqBody.commentToAdd) {
      const commentData = {
        ...reqBody.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      };
      updatetCard = await CardModel.unshiftNewComment(cardId, commentData);
    } else if (reqBody.icomingMemberInfo) {
      //  Trường hợp Add hoặc remove thành viên ra khỏi card
      updatetCard = await CardModel.updateMembers(cardId, reqBody.icomingMemberInfo);
    } else {
      const updateData = {
        ...reqBody,
        updatedAt: Date.now()
      };
      updatetCard = await CardModel.update(cardId, updateData);
    }
    return updatetCard;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  CardService: {
    newCard,
    update
  }
};