const Ticket = require('../models/Ticket');
const TicketHistory = require('../models/TicketHistory');
const AIResponse = require('../models/AIResponse');

// Create ticket
exports.createTicket = async (req, res) => {
  try {
    const { title, description, category, priority, department } = req.body;
    const ticket = await Ticket.create({
      title, description, category, priority, department,
      createdBy: req.user.id
    });
    await TicketHistory.create({
      ticketId: ticket._id,
      action: 'created',
      performedBy: req.user.id,
      comment: 'Ticket created'
    });
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tickets
exports.getTickets = async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 10 } = req.query;
    const query = {};
    if (req.user.role === 'employee') query.createdBy = req.user.id;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ticket.countDocuments(query);
    res.json({ success: true, tickets, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single ticket
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email department')
      .populate('assignedTo', 'name email');
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    const history = await TicketHistory.find({ ticketId: ticket._id })
      .populate('performedBy', 'name role')
      .sort({ createdAt: 1 });
    const aiResponses = await AIResponse.find({ ticketId: ticket._id });
    res.json({ success: true, ticket, history, aiResponses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update ticket
exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    const oldStatus = ticket.status;
    const updated = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (req.body.status && req.body.status !== oldStatus) {
      await TicketHistory.create({
        ticketId: ticket._id,
        action: 'status_changed',
        performedBy: req.user.id,
        changes: { field: 'status', oldValue: oldStatus, newValue: req.body.status }
      });
    }
    res.json({ success: true, ticket: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    await ticket.deleteOne();
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};