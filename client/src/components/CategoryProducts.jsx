import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";
import { categories } from "../assets/assets";

const CategoryProducts = () => {
  const { products } = useAppContext();

  // Get unique categories that have products
  const categoriesWithProducts = categories.filter((cat) =>
    products.some(
      (p) => p.category?.toLowerCase() === cat.path.toLowerCase() && p.inStock
    )
  );

  return (
    <div className="mt-16">
      {categoriesWithProducts.slice(0, 4).map((category, index) => {
        const categoryProducts = products
          .filter(
            (p) =>
              p.category?.toLowerCase() === category.path.toLowerCase() &&
              p.inStock
          )
          .slice(0, 5);

        if (categoryProducts.length === 0) return null;

        return (
          <div key={index} className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: category.bgColor }}
                >
                  <img
                    src={category.image}
                    alt={category.text}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <p className="text-xl md:text-2xl font-medium">
                  {category.text}
                </p>
              </div>
              <Link
                to={`/products/${category.path.toLowerCase()}`}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
              >
                View All
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {categoryProducts.map((product, idx) => (
                <ProductCard key={idx} product={product} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryProducts;
