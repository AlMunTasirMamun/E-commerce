import { useState, useEffect } from "react";

const ProductFilter = ({ products, onFilterChange }) => {
  const [filters, setFilters] = useState({
    brand: [],
    priceRange: [0, 10000],
    freeShipping: false,
  });

  // Get unique brands from products
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  // Get max price from products
  const maxPrice = Math.max(...products.map((p) => p.price), 10000);

  const handleBrandChange = (brand) => {
    const updatedBrands = filters.brand.includes(brand)
      ? filters.brand.filter((b) => b !== brand)
      : [...filters.brand, brand];

    const newFilters = { ...filters, brand: updatedBrands };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (e) => {
    const newPrice = [0, Number(e.target.value)];
    const newFilters = { ...filters, priceRange: newPrice };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFreeShippingChange = () => {
    const newFilters = {
      ...filters,
      freeShipping: !filters.freeShipping,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      brand: [],
      priceRange: [0, maxPrice],
      freeShipping: false,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="w-full md:w-64 bg-gray-50 p-6 rounded-lg mb-6 md:mb-0 md:mr-6">
      <h3 className="text-xl font-semibold mb-6">Filters</h3>

      {/* Price Filter */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-700 mb-4">Price Range</h4>
        <input
          type="range"
          min="0"
          max={maxPrice}
          value={filters.priceRange[1]}
          onChange={handlePriceChange}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between mt-3 text-sm text-gray-600">
          <span> ৳0</span>
          <span> ৳{filters.priceRange[1]}</span>
        </div>
      </div>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div className="mb-8">
          <h4 className="font-semibold text-gray-700 mb-4">Brand</h4>
          <div className="space-y-3">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brand.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-2"
                />
                <span className="ml-3 text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Free Shipping Filter */}
      <div className="mb-8">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters.freeShipping}
            onChange={handleFreeShippingChange}
            className="w-4 h-4 text-purple-600 rounded focus:ring-2"
          />
          <span className="ml-3 text-gray-700 font-medium">Free Shipping</span>
        </label>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default ProductFilter;
