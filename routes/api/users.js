const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const User = require('../../models/user');
const Joi = require('joi');
const auth = require('../../middleware/auth'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const jimp = require('jimp'); 

const upload = multer({ dest: 'tmp/' });

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET;

const { nanoid } = require('nanoid');

const { sendEmail } = require('../../email');

console.log('JWT_SECRET:', SECRET_KEY); 

if (!SECRET_KEY) {
  console.error('JWT_SECRET is not defined');
  process.exit(1); 
}


const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'Email in use' });
    }

    const verificationToken = nanoid();

    const newUser = new User({
      email,
      password: await bcrypt.hash(password, 10),
      verificationToken,
    });

    await newUser.save();

    const verificationUrl = `http://localhost:3000/api/users/verify/${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify your email',
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({
      message: 'User registered. Check your email to verify your account.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'missing required field email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verify) {
      return res.status(400).json({ message: 'Verification has already been passed' });
    }

    const verificationUrl = `http://localhost:3000/api/users/verify/${user.verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify your email',
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    next(error);
  }
});

router.get('/logout', auth, async (req, res, next) => {
  try {
    const user = req.user;
    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/current', auth, async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    res.status(200).json({ email, subscription });
  } catch (error) {
    next(error);
  }
});

router.patch('/avatars', auth, upload.single('avatar'), async (req, res, next) => {
  try {
    const { path: tempPath, originalname } = req.file;
    const ext = path.extname(originalname); 
    const newFilename = `${req.user._id}${ext}`; 
    const avatarsFolder = path.join(__dirname, '../../public/avatars');

  
    const avatar = await jimp.read(tempPath);
    await avatar.resize(250, 250); 
  
    const avatarPath = path.join(avatarsFolder, newFilename);
    
    await avatar.writeAsync(avatarPath);

    await fs.unlink(tempPath);

    const avatarURL = `/avatars/${newFilename}`;
    req.user.avatarURL = avatarURL;
    await req.user.save();

    res.status(200).json({ avatarURL });
  } catch (error) {
    next(error);
  }
});

router.get('/verify/:verificationToken', async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verify = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;