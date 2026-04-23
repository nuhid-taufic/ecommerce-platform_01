const Ticket = require("../models/Ticket");

const createTicket = async (req, res) => {
  try {
    const { userId, subject, message } = req.body;
    if (!userId || !subject || !message)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const newTicket = await Ticket.create({
      user: userId,
      subject: subject,
      messages: [{ sender: "customer", message: message }],
    });
    res.status(201).json({ success: true, ticket: newTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("user", "name email")
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.params.userId }).sort({
      updatedAt: -1,
    });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const replyTicket = async (req, res) => {
  try {
    const { message, status, sender } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    ticket.messages.push({ sender: sender || "admin", message });
    if (status) ticket.status = status;

    await ticket.save();
    res.status(200).json({ success: true, message: "Reply saved", ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const createContactTicket = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Message are required" });
    }

    const fullName = `${firstName} ${lastName}`.trim();

    const newTicket = await Ticket.create({
      guestName: fullName,
      guestEmail: email,
      subject: subject || "Contact Form Inquiry",
      messages: [{ sender: "customer", message: message }],
    });

    res.status(201).json({ success: true, ticket: newTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getUserTickets,
  replyTicket,
  createContactTicket,
};
