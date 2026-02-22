import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Blog = () => {
  const { axios } = useAppContext();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/subscriber/subscribe", { email });
      if (data.success) {
        toast.success(data.message);
        setEmail("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  const blogs = [
    {
      id: 1,
      title: "10 Tips for Smart Online Shopping",
      category: "Shopping Guide",
      date: "Jan 20, 2026",
      excerpt: "Learn how to make the best purchases online with these expert tips and tricks.",
      image: "📚"
    },
    {
      id: 2,
      title: "The Future of E-commerce in Bangladesh",
      category: "Industry Insights",
      date: "Jan 15, 2026",
      excerpt: "Exploring how e-commerce is transforming retail in Bangladesh.",
      image: "🚀"
    },
    {
      id: 3,
      title: "How to Stay Safe While Shopping Online",
      category: "Security",
      date: "Jan 10, 2026",
      excerpt: "Essential security tips to protect your personal information during online transactions.",
      image: "🔒"
    },
    {
      id: 4,
      title: "Meet Our New Features",
      category: "Product Updates",
      date: "Jan 5, 2026",
      excerpt: "Discover the latest features we've added to make your shopping experience better.",
      image: "✨"
    },
    {
      id: 5,
      title: "Seller Success Stories",
      category: "Community",
      date: "Dec 28, 2025",
      excerpt: "Inspiring stories from our marketplace sellers who turned their dreams into reality.",
      image: "🌟"
    },
    {
      id: 6,
      title: "Mobile Shopping Made Easy",
      category: "Technology",
      date: "Dec 20, 2025",
      excerpt: "Tips for shopping on the go with our mobile app.",
      image: "📱"
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest news, tips, and insights from IUBAT Marketplace
          </p>
        </div>

        {/* Blog Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <article 
              key={blog.id} 
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer group"
            >
              <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-5xl group-hover:scale-110 transition">
                {blog.image}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {blog.category}
                  </span>
                  <span className="text-xs text-gray-500">{blog.date}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {blog.excerpt}
                </p>
                <button className="text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition">
                  Read More →
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 md:p-12 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">Subscribe to Our Newsletter</h3>
          <p className="mb-6 text-indigo-100">Get the latest blog posts delivered to your inbox</p>
          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-white"
            />
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            >
              {loading ? "..." : "Subscribe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Blog;
