const { BoardModal } = require("@/models/BoardModel");
const { CardModel } = require("@/models/CardModel");
const { ColumnModel } = require("@/models/ColumnModel");
const { slugify } = require("@/utils/formatters");

const newCard = async (data) => {
  try {
    const newData = {
      ...data,
      slug: slugify(data.title),
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

const update = async (cardId, data) => {
  try {
    const updateCard = await CardModel.update(cardId, data);
    return updateCard;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  CardService: {
    newCard,
    update,
  },
};
