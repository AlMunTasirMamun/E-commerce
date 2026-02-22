import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import SellerNotification from "../models/sellerNotification.model.js";

// Create a new review (User)
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.userId || req.user;

    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user has a delivered order with this product
    const deliveredOrder = await Order.findOne({
      userId: userId,
      status: "Delivered",
      "items.product": productId,
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        success: false,
        message: "You can only review products that have been delivered to you",
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = new Review({
      product: productId,
      user: userId,
      rating: Number(rating),
      title,
      comment,
    });

    await review.save();

    // Create notification for seller/admin
    await SellerNotification.create({
      type: "new_review",
      title: "New Product Review",
      message: `A customer left a ${rating}-star review for "${product.name}"`,
      relatedId: review._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully. It will be visible after approval.",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit review",
    });
  }
};

// Get reviews for a product (Public - only approved reviews)
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({
      product: productId,
      isApproved: true,
      isHidden: false,
    })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : 0;

    // Rating breakdown
    const ratingBreakdown = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    res.status(200).json({
      success: true,
      reviews,
      stats: {
        totalReviews,
        avgRating: Number(avgRating),
        ratingBreakdown,
      },
    });
  } catch (error) {
    console.error("Error getting reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// Check if user can review a product
export const canUserReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId || req.user;

    // Check if user already reviewed
    const existingReview = await Review.findOne({ product: productId, user: userId });
    
    // Check if user has a delivered order with this product
    const deliveredOrder = await Order.findOne({
      userId: userId,
      status: "Delivered",
      "items.product": productId,
    });

    const canReview = !existingReview && !!deliveredOrder;

    res.status(200).json({
      success: true,
      canReview,
      hasDeliveredOrder: !!deliveredOrder,
      alreadyReviewed: !!existingReview,
      existingReview: existingReview || null,
    });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check review eligibility",
    });
  }
};

// Update own review (User)
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.userId || req.user;

    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not authorized",
      });
    }

    if (rating) review.rating = Number(rating);
    if (title) review.title = title;
    if (comment) review.comment = comment;
    review.isApproved = false; // Requires re-approval after edit

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review updated. It will be visible after approval.",
      review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

// Delete own review (User)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId || req.user;

    const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

// ==================== ADMIN/SELLER FUNCTIONS ====================

// Get all reviews (Admin)
export const getAllReviews = async (req, res) => {
  try {
    const { status, rating, search } = req.query;

    let filter = {};

    if (status === "pending") {
      filter.isApproved = false;
      filter.isHidden = false;
    } else if (status === "approved") {
      filter.isApproved = true;
    } else if (status === "hidden") {
      filter.isHidden = true;
    }

    if (rating) {
      filter.rating = Number(rating);
    }

    let reviews = await Review.find(filter)
      .populate("user", "name email profilePicture")
      .populate("product", "name image")
      .sort({ createdAt: -1 });

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      reviews = reviews.filter(
        (r) =>
          r.title?.toLowerCase().includes(searchLower) ||
          r.comment?.toLowerCase().includes(searchLower) ||
          r.user?.name?.toLowerCase().includes(searchLower) ||
          r.product?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Stats
    const allReviews = await Review.find({});
    const stats = {
      total: allReviews.length,
      pending: allReviews.filter((r) => !r.isApproved && !r.isHidden).length,
      approved: allReviews.filter((r) => r.isApproved).length,
      hidden: allReviews.filter((r) => r.isHidden).length,
      avgRating:
        allReviews.length > 0
          ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
          : 0,
    };

    res.status(200).json({
      success: true,
      reviews,
      stats,
    });
  } catch (error) {
    console.error("Error getting all reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// Approve a review (Admin)
export const approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isApproved: true, isHidden: false },
      { new: true }
    ).populate("user", "name");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review approved successfully",
      review,
    });
  } catch (error) {
    console.error("Error approving review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve review",
    });
  }
};

// Hide/Unhide a review (Admin)
export const toggleHideReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.isHidden = !review.isHidden;
    if (review.isHidden) {
      review.isApproved = false;
    }
    await review.save();

    res.status(200).json({
      success: true,
      message: review.isHidden ? "Review hidden" : "Review unhidden",
      review,
    });
  } catch (error) {
    console.error("Error toggling review visibility:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review visibility",
    });
  }
};

// Reply to a review (Admin)
export const replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({
        success: false,
        message: "Reply is required",
      });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        adminReply: reply,
        adminRepliedAt: new Date(),
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      review,
    });
  } catch (error) {
    console.error("Error replying to review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add reply",
    });
  }
};

// Delete review (Admin)
export const adminDeleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

// Bulk approve reviews (Admin)
export const bulkApproveReviews = async (req, res) => {
  try {
    const { reviewIds } = req.body;

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Review IDs are required",
      });
    }

    await Review.updateMany(
      { _id: { $in: reviewIds } },
      { isApproved: true, isHidden: false }
    );

    res.status(200).json({
      success: true,
      message: `${reviewIds.length} reviews approved successfully`,
    });
  } catch (error) {
    console.error("Error bulk approving reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve reviews",
    });
  }
};
