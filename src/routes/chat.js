const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/', chatController.chat);
router.get('/memory', chatController.getMemory);
router.post('/memory', chatController.saveMemory);
router.delete('/memory', chatController.deleteMemory);
router.get('/history', chatController.getHistory);

module.exports = router;
