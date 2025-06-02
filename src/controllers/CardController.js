const { CardService } = require("@/services/CardService");
const { StatusCodes } = require("http-status-codes");

const newCard = async (req, res, next) => {
  try {
    const newCard = await CardService.newCard(req.body);
    res.status(StatusCodes.CREATED).json(newCard);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const cardCoverFile = req.file;
    const userInfo = req.jwtDecoded;
    const updateCard = await CardService.update(
      cardId,
      req.body,
      cardCoverFile,
      userInfo
    );
    res.status(StatusCodes.OK).json(updateCard);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  CardController: {
    newCard,
    update,
  },
};
