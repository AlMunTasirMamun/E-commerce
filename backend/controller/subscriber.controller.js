import Subscriber from "../models/subscriber.model.js";

// Subscribe to newsletter
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.isActive) {
        return res.json({ success: false, message: "You are already subscribed!" });
      } else {
        // Reactivate subscription
        existing.isActive = true;
        await existing.save();
        return res.json({ success: true, message: "Welcome back! Subscription reactivated." });
      }
    }

    // Create new subscriber
    const subscriber = new Subscriber({ email: email.toLowerCase() });
    await subscriber.save();

    res.json({ success: true, message: "Successfully subscribed to newsletter!" });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Unsubscribe from newsletter
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    if (!subscriber) {
      return res.json({ success: false, message: "Email not found in subscription list" });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.json({ success: true, message: "Successfully unsubscribed" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get all subscribers (Admin only)
export const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    
    const stats = {
      total: subscribers.length,
      active: subscribers.filter(s => s.isActive).length,
      inactive: subscribers.filter(s => !s.isActive).length,
    };

    res.json({ success: true, subscribers, stats });
  } catch (error) {
    console.error("Get subscribers error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Delete subscriber (Admin only)
export const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Subscriber.findByIdAndDelete(id);

    res.json({ success: true, message: "Subscriber deleted successfully" });
  } catch (error) {
    console.error("Delete subscriber error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Toggle subscriber status (Admin only)
export const toggleSubscriberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      return res.json({ success: false, message: "Subscriber not found" });
    }

    subscriber.isActive = !subscriber.isActive;
    await subscriber.save();

    res.json({ 
      success: true, 
      message: `Subscriber ${subscriber.isActive ? "activated" : "deactivated"} successfully` 
    });
  } catch (error) {
    console.error("Toggle subscriber status error:", error);
    res.json({ success: false, message: error.message });
  }
};
