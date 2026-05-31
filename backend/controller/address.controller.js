import Address from "../models/address.model.js";

// POST /api/address/add
export const addAddress = async (req, res) => {
  try {
    const { street, city, district, state, country } = req.body;

    if (!street || !city || !district || !state || !country) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const savedAddress = await Address.create({
      userId: req.user,
      street,
      city,
      district,
      state,
      country,
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: savedAddress,
    });
  } catch (error) {
    console.log("ADDRESS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Address add failed",
    });
  }
};

// GET /api/address/get
export const getAddress = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user });
    res.status(200).json({ success: true, addresses });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
