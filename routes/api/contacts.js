const express = require('express');
const Contact = require('../../models/contact');

const router = express.Router();

router.patch('/:contactId/favorite', async (req, res, next) => {
  try {
    const { favorite } = req.body;
    if (favorite === undefined) {
      return res.status(400).json({ message: 'missing field favorite' });
    }
    
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.contactId, 
      { favorite }, 
      { new: true }
    );
    
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    
    res.json(updatedContact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;