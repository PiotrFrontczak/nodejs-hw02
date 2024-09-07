const multer = require('multer');
const jimp = require('jimp');
const path = require('path');
const fs = require('fs').promises;

const upload = multer({ dest: 'tmp/' });

router.patch('/avatars', auth, upload.single('avatar'), async (req, res, next) => {
  try {
    const { path: tempPath, originalname } = req.file;
    const ext = path.extname(originalname);
    const newFilename = `${req.user._id}${ext}`;

    const avatar = await jimp.read(tempPath);
    await avatar.resize(350, 350);
    const avatarPath = path.join(__dirname, '../../public/avatars', newFilename);
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

module.exports = router;