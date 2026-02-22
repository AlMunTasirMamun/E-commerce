import SupportMessage from "../models/support.model.js";
import SellerNotification from "../models/sellerNotification.model.js";

// User: Create a new support message
export const createSupportMessage = async (req, res) => {
  console.log("createSupportMessage called with:", req.body);
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      console.log("Missing fields:", { name, email, subject, message });
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const supportMessage = new SupportMessage({
      userId: req.userId || null,
      name,
      email,
      subject,
      message,
    });

    await supportMessage.save();
    console.log("Support message saved:", supportMessage._id);

    // Create notification for admin
    await SellerNotification.create({
      type: "support_message",
      title: "New Support Message",
      message: `${name} sent a support message: "${subject}"`,
      relatedId: supportMessage._id,
      relatedModel: "SupportMessage",
      metadata: {
        userName: name,
        userEmail: email,
        subject: subject,
      },
    });
    console.log("Notification created");

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
      supportMessage,
    });
  } catch (error) {
    console.error("Error creating support message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again.",
    });
  }
};

// User: Get their support messages
export const getUserSupportMessages = async (req, res) => {
  try {
    const { userId } = req;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login to view your messages",
      });
    }

    const messages = await SupportMessage.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching user messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

// User: Mark message as read
export const markUserMessageRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const message = await SupportMessage.findOneAndUpdate(
      { _id: id, userId },
      { userRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update message",
    });
  }
};

// Admin: Get all support messages
export const getAllSupportMessages = async (req, res) => {
  console.log("getAllSupportMessages called");
  try {
    const { status, priority, search } = req.query;
    console.log("Query params:", { status, priority, search });
    
    let query = {};
    
    if (status && status !== "all") {
      query.status = status;
    }
    
    if (priority && priority !== "all") {
      query.priority = priority;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const messages = await SupportMessage.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    const stats = {
      total: await SupportMessage.countDocuments(),
      pending: await SupportMessage.countDocuments({ status: "pending" }),
      inProgress: await SupportMessage.countDocuments({ status: "in-progress" }),
      resolved: await SupportMessage.countDocuments({ status: "resolved" }),
      unread: await SupportMessage.countDocuments({ isRead: false }),
    };

    console.log("Returning messages:", messages.length, "stats:", stats);
    res.json({
      success: true,
      messages,
      stats,
    });
  } catch (error) {
    console.error("Error fetching support messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

// Admin: Get single message
export const getSupportMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await SupportMessage.findById(id)
      .populate("userId", "name email");

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Mark as read
    if (!message.isRead) {
      message.isRead = true;
      await message.save();
    }

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch message",
    });
  }
};

// Admin: Reply to a support message
export const replyToSupportMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, status } = req.body;

    if (!reply) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    const message = await SupportMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    message.adminReply = reply;
    message.repliedAt = new Date();
    message.repliedBy = "Admin";
    message.status = status || "resolved";
    message.userRead = false; // User needs to read the reply

    await message.save();

    res.json({
      success: true,
      message: "Reply sent successfully",
      supportMessage: message,
    });
  } catch (error) {
    console.error("Error replying to message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reply",
    });
  }
};

// Admin: Update message status
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    const message = await SupportMessage.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message: "Message updated successfully",
      supportMessage: message,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update message",
    });
  }
};

// Admin: Delete a support message
export const deleteSupportMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await SupportMessage.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
};
