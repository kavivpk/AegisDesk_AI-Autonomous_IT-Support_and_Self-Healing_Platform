const Ticket = require('../models/Ticket');

exports.getStats = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });
    const escalatedTickets = await Ticket.countDocuments({ status: 'Escalated' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });

    const categoryBreakdown = await Ticket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const priorityBreakdown = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const last7Days = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const resolutionRate = totalTickets > 0
      ? Math.round((resolvedTickets / totalTickets) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        totalTickets, openTickets, resolvedTickets,
        escalatedTickets, inProgressTickets, resolutionRate,
        categoryBreakdown, priorityBreakdown, last7Days
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};