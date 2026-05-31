import User from "../models/user.model.js";
import Product from "../models/product.model.js";

export const updateCart = async (req, res) => {
  try {
    const userId = req.user;
    const { cartItems } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const previousCart = user.cartItems || {};

    const stockChanges = {};

    // restore old cart
    for (const productId in previousCart) {
      const qty = previousCart[productId]?.quantity || 0;

      stockChanges[productId] =
        (stockChanges[productId] || 0) + qty;
    }

    // subtract new cart
    for (const productId in cartItems) {
      const qty = cartItems[productId]?.quantity || 0;

      stockChanges[productId] =
        (stockChanges[productId] || 0) - qty;
    }

    // get all products once
    const productIds = Object.keys(stockChanges);

    const products = await Product.find({
      _id: { $in: productIds },
    });

    const productMap = {};

    products.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    // validate
    for (const productId of productIds) {
      const product = productMap[productId];

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const newStock =
        product.stock + stockChanges[productId];

      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available for ${product.name}`,
        });
      }
    }

    // apply stock changes
    for (const productId of productIds) {
      const product = productMap[productId];

      product.stock += stockChanges[productId];

      product.inStock = product.stock > 0;

      await product.save();
    }

    // save cart
    user.cartItems = cartItems;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
    });

  } catch (error) {
    console.error("Update Cart Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};