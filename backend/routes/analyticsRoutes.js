const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin', 'it_engineer'), getStats);

module.exports = router;