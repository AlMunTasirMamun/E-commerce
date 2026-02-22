import Product from "../models/product.model.js";


// add product :/api/product/add
export const addProduct = async (req, res) => {
  try {
    const { name, price, offerPrice, description, category, freeShipping, stock } = req.body;
    // const image = req.files?.map((file) => `/uploads/${file.filename}`);
    const image = req.files?.map((file) => file.filename);
    if (
      !name ||
      !price ||
      !offerPrice ||
      !description ||
      !category ||
      !image ||
      image.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields including images are required",
      });
    }

    const stockNum = stock ? Number(stock) : 10;
    
    const product = new Product({
      name,
      price,
      offerPrice,
      description,
      category,
      image,
      freeShipping: freeShipping === 'true' || freeShipping === true,
      stock: stockNum,
      inStock: stockNum > 0,
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      product: savedProduct,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error in addProduct:", error);

    return res
      .status(500)
      .json({ success: false, message: "Server error while adding product" });
  }
};

// get products :/api/product/get
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// get single product :/api/product/id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// change stock  :/api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock, stock } = req.body;
    
    // If stock quantity is provided, update both stock and inStock
    if (stock !== undefined) {
      const stockNum = Number(stock);
      const product = await Product.findByIdAndUpdate(
        id,
        { 
          stock: stockNum,
          inStock: stockNum > 0 
        },
        { new: true }
      );
      return res.status(200).json({ 
        success: true, 
        product, 
        message: stockNum > 0 ? "Stock updated successfully" : "Product marked as out of stock" 
      });
    }
    
    // Otherwise just toggle inStock (legacy support)
    const product = await Product.findByIdAndUpdate(
      id,
      { inStock },
      { new: true }
    );
    res
      .status(200)
      .json({ success: true, product, message: "Stock updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// update price  :/api/product/update-price
export const updatePrice = async (req, res) => {
  try {
    const { id, price, offerPrice, freeShipping } = req.body;
    
    if (!id || !price || !offerPrice) {
      return res.status(400).json({
        success: false,
        message: "Product ID, price and offer price are required",
      });
    }

    const updateData = { 
      price: Number(price), 
      offerPrice: Number(offerPrice) 
    };
    
    // Only update freeShipping if it's provided
    if (freeShipping !== undefined) {
      updateData.freeShipping = freeShipping;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
      message: "Price updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
