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

module.exports = {
  CardController: {
    newCard,
  },
};
