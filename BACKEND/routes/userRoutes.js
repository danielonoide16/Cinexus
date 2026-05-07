const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
    filename: (req, file, cb) => cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
}});

router.get('/public/:userId', auth, (req, res, next) => userController.getPublicProfile(req, res).catch(next));
router.get('/me', auth, (req, res, next) => userController.getProfile(req, res).catch(next));
router.put('/me', auth, (req, res, next) => userController.updateProfile(req, res).catch(next));
router.delete('/me', auth, (req, res, next) => userController.deleteAccount(req, res).catch(next));
router.post('/me/avatar', auth, upload.single('avatar'), (req, res, next) => userController.uploadAvatar(req, res).catch(next));
router.get('/search', auth, (req, res, next) => userController.searchUsers(req, res).catch(next));
router.get('/:id', auth, (req, res, next) => userController.getUserById(req, res).catch(next));

module.exports = router;
