const express = require('express');
const Joi = require('joi');
const Contact = require('../../models/contact');
const auth = require('../../middlewares/auth');

const router = express.Router();

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

router.get('/', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, favorite } = req.query;
    const skip = (page - 1) * limit;

    const filter = { owner: req.user._id };
    if (favorite !== undefined) {
      filter.favorite = favorite === 'true';
    }

    const contacts = await Contact.find(filter)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

module.exports = router;