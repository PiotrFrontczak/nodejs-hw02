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
    const contacts = await Contact.find({ owner: req.user._id });
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get('/:contactId', auth, async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.contactId, owner: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: `missing required ${error.details[0].context.key} field` });
    }

    const newContact = await Contact.create({ ...req.body, owner: req.user._id });
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.put('/:contactId', auth, async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'missing fields' });
    }

    const updatedContact = await Contact.findOneAndUpdate(
      { _id: req.params.contactId, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

router.delete('/:contactId', auth, async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.contactId, owner: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json({ message: 'contact deleted' });
  } catch (error) {
    next(error);
  }
});

router.patch('/:contactId/favorite', auth, async (req, res, next) => {
  try {
    const { favorite } = req.body;
    if (favorite === undefined) {
      return res.status(400).json({ message: 'missing field favorite' });
    }

    const updatedContact = await Contact.findOneAndUpdate(
      { _id: req.params.contactId, owner: req.user._id },
      { favorite },
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;