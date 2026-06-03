const express = require('express');
const router = express.Router();
const { createTicket, getTickets, getTicket, updateTicket, deleteTicket } = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getTickets).post(createTicket);
router.route('/:id').get(getTicket).put(updateTicket).delete(authorize('admin', 'it_engineer'), deleteTicket);

module.exports = router;