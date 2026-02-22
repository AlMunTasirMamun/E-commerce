import { assets, categories } from "../../assets/assets";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddProduct = () => {
  const { axios, fetchProducts, navigate } = useContext(AppContext);
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [freeShipping, setFreeShipping] = useState(false);
  const [stock, setStock] = useState("10");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [customCategories, setCustomCategories] = useState([]);

  // Load custom categories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("customCategories");
    if (saved) {
      setCustomCategories(JSON.parse(saved));
    }
  }, []);

  // All categories (default + custom)
  const allCategories = [
    ...categories,
    ...customCategories.map(cat => ({ text: cat, path: cat }))
  ];

  // Handle category selection
  const handleCategoryChange = (value) => {
    if (value === "ADD_NEW") {
      setShowNewCategoryInput(true);
      setCategory("");
    } else {
      setCategory(value);
      setShowNewCategoryInput(false);
    }
  };

  // Add new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    
    // Check if category already exists
    const exists = allCategories.some(
      c => c.path.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    
    if (exists) {
      toast.error("Category already exists");
      return;
    }

    const updatedCustomCategories = [...customCategories, newCategoryName.trim()];
    setCustomCategories(updatedCustomCategories);
    localStorage.setItem("customCategories", JSON.stringify(updatedCustomCategories));
    
    setCategory(newCategoryName.trim());
    setNewCategoryName("");
    setShowNewCategoryInput(false);
    toast.success("Category added successfully!");
  };

  // Calculate offer price when price or discount changes
  const handlePriceChange = (newPrice) => {
    setPrice(newPrice);
    if (newPrice && discount) {
      const calculatedOffer = Math.round(newPrice - (newPrice * discount / 100));
      setOfferPrice(calculatedOffer.toString());
    } else if (newPrice) {
      setOfferPrice(newPrice);
    }
  };

  const handleDiscountChange = (newDiscount) => {
    const discountValue = Math.min(100, Math.max(0, newDiscount));
    setDiscount(discountValue.toString());
    if (price && discountValue) {
      const calculatedOffer = Math.round(price - (price * discountValue / 100));
      setOfferPrice(calculatedOffer.toString());
    } else if (price) {
      setOfferPrice(price);
    }
  };

  const handleOfferPriceChange = (newOfferPrice) => {
    setOfferPrice(newOfferPrice);
    if (price && newOfferPrice) {
      const calculatedDiscount = Math.round(((price - newOfferPrice) / price) * 100);
      setDiscount(calculatedDiscount >= 0 ? calculatedDiscount.toString() : "0");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("offerPrice", offerPrice);
      formData.append("freeShipping", freeShipping);
      formData.append("stock", stock);

      files.forEach((file) => {
        if (file) formData.append("image", file);
      });

      const { data } = await axios.post(
        "/api/product/add-product",
        formData
      );

      if (data.success) {
        toast.success("Product added successfully");

        // ✅ RESET FORM
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setDiscount("");
        setOfferPrice("");
        setFreeShipping(false);
        setStock("10");
        setFiles([]);

        // ✅ THIS IS THE KEY FIX
        await fetchProducts();            // refresh product list
        navigate("/seller/products");     // go to product list
      } else {
        toast.error(data.message, { icon: null });
      }
    } catch (error) {
      toast.error(error.message, { icon: null });
    }
  };

  return (
    <div className="py-10 bg-white">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4)
              .fill("")
              .map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    id={`image${index}`}
                    onChange={(e) => {
                      const updated = [...files];
                      updated[index] = e.target.files[0];
                      setFiles(updated);
                    }}
                  />
                  <img
                    src={
                      files[index]
                        ? URL.createObjectURL(files[index])
                        : assets.upload_area
                    }
                    alt="upload"
                    className="max-w-24 cursor-pointer"
                  />
                </label>
              ))}
          </div>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Name"
          required
          className="border p-2 w-full rounded"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product Description"
          className="border p-2 w-full rounded"
        />

        {/* Category Section */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <p className="text-sm font-medium text-gray-700 mb-2">📁 Category</p>
          
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            required={!showNewCategoryInput}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="">Select Category</option>
            {allCategories.map((c, i) => (
              <option key={i} value={c.path}>
                {c.path}
              </option>
            ))}
            <option value="ADD_NEW" className="font-semibold text-indigo-600">
              ➕ Add New Category
            </option>
          </select>

          {/* New Category Input */}
          {showNewCategoryInput && (
            <div className="mt-3 p-3 bg-white border-2 border-dashed border-indigo-300 rounded-lg">
              <label className="text-xs font-medium text-indigo-600 mb-2 block">New Category Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name..."
                  className="flex-1 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName("");
                  }}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Current Selection */}
          {category && !showNewCategoryInput && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Selected: <span className="font-medium text-gray-800">{category}</span>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <p className="text-sm font-medium text-gray-700 mb-2">💰 Pricing</p>
          
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Original Price (৳)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="Enter original price"
              required
              min="0"
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Discount (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Offer Price (৳)</label>
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => handleOfferPriceChange(e.target.value)}
                placeholder="Calculated price"
                required
                min="0"
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-green-50"
              />
            </div>
          </div>

          {price && offerPrice && price > offerPrice && (
            <div className="bg-green-100 border border-green-200 rounded-lg p-3 text-sm">
              <p className="text-green-700">
                <span className="font-semibold">Savings:</span> ৳{(price - offerPrice).toLocaleString()} ({discount || 0}% off)
              </p>
            </div>
          )}
        </div>

        {/* Free Shipping Toggle */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">🚚 Shipping Options</p>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-800">Free Shipping</p>
              <p className="text-xs text-gray-500">Enable free shipping for this product</p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={freeShipping}
                onChange={(e) => setFreeShipping(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-checked:bg-green-500 rounded-full transition"></div>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition"></span>
            </div>
          </label>
          {freeShipping && (
            <div className="mt-3 flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>This product will have free shipping</span>
            </div>
          )}
        </div>

        {/* Stock Management */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">📦 Stock Management</p>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Stock Quantity</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStock(Math.max(0, Number(stock) - 1).toString())}
                className="w-10 h-10 rounded-lg bg-red-100 text-red-600 font-bold hover:bg-red-200 transition"
              >
                -
              </button>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
                required
                className="flex-1 text-center py-3 border border-gray-300 rounded-lg font-semibold text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setStock((Number(stock) + 1).toString())}
                className="w-10 h-10 rounded-lg bg-green-100 text-green-600 font-bold hover:bg-green-200 transition"
              >
                +
              </button>
            </div>
            {Number(stock) === 0 && (
              <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                ⚠️ Product will be marked as "Stock Out" and won't be purchasable
              </p>
            )}
            {Number(stock) > 0 && Number(stock) <= 5 && (
              <p className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded-lg">
                ⚠️ Low stock warning will be shown to customers
              </p>
            )}
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
