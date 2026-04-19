const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');

router.get('/', toolController.listTools);
router.post('/execute', toolController.executeTool);
router.post('/skill', toolController.loadSkill);
router.post('/register', toolController.registerTool);

module.exports = router;
