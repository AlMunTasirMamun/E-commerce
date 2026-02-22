import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import PaymentReceipt from "./PaymentReceipt";

const PaymentModal = ({ isOpen, onClose, cartItems, selectedAddress, totalAmount, shippingAmount = 0, isExpressDelivery = false }) => {
  const { axios, navigate, setCartItems } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  
  // OTP Flow States
  const [step, setStep] = useState(1); // 1: select method, 2: enter phone, 3: verify OTP, 4: processing
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Receipt States
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Payment methods that require OTP
  const otpRequiredMethods = ["bkash", "nagad", "rocket", "dbbl"];

  // Payment methods with actual logos
  const paymentMethods = [
    { 
      id: "bkash", 
      name: "bKash", 
      logo: "https://www.logo.wine/a/logo/BKash/BKash-bKash-Logo.wine.svg",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50"
    },
    { 
      id: "nagad", 
      name: "Nagad", 
      logo: "https://nagad.com.bd/wp-content/uploads/2023/05/logo-vertical.png",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    },
    { 
      id: "rocket", 
      name: "Rocket", 
      logo: "https://www.dutchbanglabank.com/img/rocket/logo.png",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      id: "dbbl", 
      name: "DBBL", 
      logo: "https://www.dutchbanglabank.com/img/logo.png",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      id: "visa", 
      name: "Visa Card", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
      color: "from-indigo-400 to-indigo-600",
      bgColor: "bg-indigo-50"
    },
    { 
      id: "mastercard", 
      name: "MasterCard", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
      color: "from-orange-400 to-red-500",
      bgColor: "bg-orange-50"
    },
    { 
      id: "cod", 
      name: "Cash on Delivery", 
      logo: null,
      icon: "💵",
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-50"
    },
  ];

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setPhoneNumber("");
      setOtp(["", "", "", "", "", ""]);
      setGeneratedOtp("");
      setOtpSent(false);
      setResendTimer(0);
      setShowReceipt(false);
      setReceiptData(null);
    }
  }, [isOpen]);

  // Generate random 6-digit OTP (sandbox)
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Handle phone number submission and send OTP
  const handleSendOTP = () => {
    if (!phoneNumber || phoneNumber.length < 11) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);
    setOtpSent(true);
    setResendTimer(60);
    setStep(3);
    
    // Show OTP in toast for sandbox testing
    toast.success(`OTP sent to ${phoneNumber}`);
    toast(`🔐 Sandbox OTP: ${newOtp}`, {
      duration: 10000,
      icon: "📱",
      style: {
        background: "#4F46E5",
        color: "#fff",
        fontWeight: "bold",
      },
    });
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Verify OTP and process payment
  const verifyOtpAndPay = async () => {
    const enteredOtp = otp.join("");
    
    if (enteredOtp.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    if (enteredOtp !== generatedOtp) {
      toast.error("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      return;
    }

    // OTP verified, proceed with payment
    setStep(4);
    await processPayment();
  };

  // Process the actual payment
  const processPayment = async () => {
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    setLoading(true);

    try {
      // Create payment for online methods
      const { data } = await axios.post("/api/payment/create-online-payment", {
        items: cartItems,
        address: selectedAddress._id,
        paymentMethod: paymentMethod,
        phoneNumber: phoneNumber,
        shippingFee: shippingAmount, // Send shipping fee separately
        isExpressDelivery: isExpressDelivery, // Express delivery option
      });

      if (data.success) {
        // Prepare receipt data
        const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
        const subtotal = totalAmount;
        const tax = (totalAmount * 0.05).toFixed(2);
        const total = (totalAmount * 1.05 + shippingAmount).toFixed(2);

        setReceiptData({
          transactionId: data.transactionId || `TXN-${Date.now()}`,
          date: new Date().toISOString(),
          paymentMethod: selectedMethod?.name,
          paymentMethodIcon: selectedMethod?.logo,
          phoneNumber: phoneNumber,
          items: Object.values(cartItems),
          subtotal: subtotal,
          shipping: shippingAmount,
          tax: tax,
          totalAmount: total,
        });

        setCartItems({});
        setShowReceipt(true);
        toast.success("Payment successful! 🎉");
      } else {
        toast.error(data.message || "Failed to process payment");
        setStep(3);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed");
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  // Handle COD or card payments (no OTP)
  const handleDirectPayment = async () => {
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === "cod") {
        const { data } = await axios.post("/api/order/cod", {
          items: cartItems,
          address: selectedAddress._id,
          shippingFee: shippingAmount, // Send shipping fee separately
          isExpressDelivery: isExpressDelivery, // Express delivery option
        });

        if (data.success) {
          toast.success("Order placed successfully!");
          setCartItems({});
          onClose();
          setTimeout(() => navigate("/my-orders"), 1000);
        } else {
          toast.error(data.message || "Failed to place order");
        }
      } else {
        // Card payments
        const { data } = await axios.post("/api/payment/create-online-payment", {
          items: cartItems,
          address: selectedAddress._id,
          paymentMethod: paymentMethod,
          shippingFee: shippingAmount, // Send shipping fee separately
          isExpressDelivery: isExpressDelivery, // Express delivery option
        });

        if (data.success) {
          // Prepare receipt data for card payments
          const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
          const subtotal = totalAmount;
          const tax = (totalAmount * 0.05).toFixed(2);
          const total = (totalAmount * 1.05 + shippingAmount).toFixed(2);

          setReceiptData({
            transactionId: data.transactionId || `TXN-${Date.now()}`,
            date: new Date().toISOString(),
            paymentMethod: selectedMethod?.name,
            paymentMethodIcon: selectedMethod?.logo,
            phoneNumber: null,
            items: Object.values(cartItems),
            subtotal: subtotal,
            shipping: shippingAmount,
            tax: tax,
            totalAmount: total,
          });

          setCartItems({});
          setShowReceipt(true);
          toast.success("Payment processed successfully!");
        } else {
          toast.error(data.message || "Failed to process payment");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle proceed button based on payment method
  const handleProceed = () => {
    if (otpRequiredMethods.includes(paymentMethod)) {
      setStep(2);
    } else {
      handleDirectPayment();
    }
  };

  if (!isOpen) return null;

  const selectedMethodInfo = paymentMethods.find(m => m.id === paymentMethod);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Step 1: Select Payment Method */}
        {step === 1 && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Select Payment Method</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-3xl"
              >
                ×
              </button>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition transform hover:scale-105 ${
                    paymentMethod === method.id
                      ? `border-indigo-500 ${method.bgColor} shadow-lg`
                      : `border-gray-200 hover:border-gray-300 bg-gray-50`
                  }`}
                >
                  <div className="h-12 flex items-center justify-center mb-2">
                    {method.logo ? (
                      <img 
                        src={method.logo} 
                        alt={method.name} 
                        className="h-10 w-auto object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span className={`text-4xl ${method.logo ? 'hidden' : ''}`}>{method.icon || '💳'}</span>
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-center text-gray-800">
                    {method.name}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p className="text-sm font-semibold mb-3">Order Summary</p>
              <p className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">৳{totalAmount}</span>
              </p>
              <p className="flex justify-between mb-2">
                <span className="text-gray-600">Tax (5%):</span>
                <span className="font-semibold">৳{(totalAmount * 0.05).toFixed(2)}</span>
              </p>
              <p className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping:</span>
                <span className={`font-semibold ${shippingAmount === 0 ? 'text-green-600' : ''}`}>
                  {shippingAmount === 0 ? 'Free' : `৳${shippingAmount}`}
                </span>
              </p>
              <div className="border-t pt-2 mt-2">
                <p className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-indigo-600">৳{(totalAmount * 1.05 + shippingAmount).toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* Selected Method Info */}
            <div className={`bg-gradient-to-r ${selectedMethodInfo?.color} p-4 rounded-lg text-white mb-6`}>
              <p className="text-sm opacity-90">Selected Payment Method:</p>
              <p className="text-xl font-bold flex items-center gap-2">
                {selectedMethodInfo?.logo ? (
                  <img src={selectedMethodInfo.logo} alt="" className="h-6 w-auto bg-white rounded p-0.5" />
                ) : (
                  <span>{selectedMethodInfo?.icon}</span>
                )}
                {selectedMethodInfo?.name}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-semibold transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                className="flex-1 bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 disabled:opacity-50 font-semibold transition"
                disabled={loading}
              >
                {loading ? "Processing..." : `Confirm & Pay ৳${(totalAmount * 1.05 + shippingAmount).toFixed(2)}`}
              </button>
            </div>
          </>
        )}

        {/* Step 2: Enter Phone Number */}
        {step === 2 && (
          <>
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold">Enter Phone Number</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-3xl"
              >
                ×
              </button>
            </div>

            {/* Selected Method Display */}
            <div className={`bg-gradient-to-r ${selectedMethodInfo?.color} p-4 rounded-lg text-white mb-6`}>
              <p className="text-xl font-bold flex items-center gap-2">
                {selectedMethodInfo?.logo ? (
                  <img src={selectedMethodInfo.logo} alt="" className="h-6 w-auto bg-white rounded p-0.5" />
                ) : (
                  <span>{selectedMethodInfo?.icon}</span>
                )}
                {selectedMethodInfo?.name}
              </p>
              <p className="text-sm opacity-90 mt-1">Amount: ৳{(totalAmount * 1.05 + shippingAmount).toFixed(2)}</p>
            </div>

            {/* Phone Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your {selectedMethodInfo?.name} registered phone number
              </label>
              <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-indigo-500">
                <span className="bg-gray-100 px-4 py-3 text-gray-600 font-medium">+880</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="1XXXXXXXXX"
                  className="flex-1 px-4 py-3 outline-none text-lg"
                  maxLength={11}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We'll send a 6-digit OTP to verify your payment
              </p>
            </div>

            {/* Sandbox Notice */}
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-6">
              <p className="text-sm text-yellow-800">
                🧪 <strong>Sandbox Mode:</strong> OTP will be displayed in a notification for testing purposes.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Back
              </button>
              <button
                onClick={handleSendOTP}
                className="flex-1 bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 disabled:opacity-50 font-semibold transition"
                disabled={!phoneNumber || phoneNumber.length < 10}
              >
                Send OTP
              </button>
            </div>
          </>
        )}

        {/* Step 3: Verify OTP */}
        {step === 3 && (
          <>
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setStep(2)}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold">Verify OTP</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-3xl"
              >
                ×
              </button>
            </div>

            {/* OTP Sent Message */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">📱</div>
              <p className="text-gray-600">
                We've sent a 6-digit OTP to
              </p>
              <p className="font-bold text-lg">+880 {phoneNumber}</p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  maxLength={1}
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div className="text-center mb-6">
              {resendTimer > 0 ? (
                <p className="text-gray-500 text-sm">
                  Resend OTP in <span className="font-bold text-indigo-600">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  onClick={handleSendOTP}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Sandbox OTP Hint */}
            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg mb-6 text-center">
              <p className="text-sm text-indigo-800">
                🔐 <strong>Sandbox OTP:</strong> <span className="font-mono text-lg">{generatedOtp}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Change Number
              </button>
              <button
                onClick={verifyOtpAndPay}
                className="flex-1 bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 disabled:opacity-50 font-semibold transition"
                disabled={otp.join("").length !== 6}
              >
                Verify & Pay ৳{(totalAmount * 1.05 + shippingAmount).toFixed(2)}
              </button>
            </div>
          </>
        )}

        {/* Step 4: Processing Payment */}
        {step === 4 && !showReceipt && (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we process your {selectedMethodInfo?.name} payment...</p>
            <div className={`bg-gradient-to-r ${selectedMethodInfo?.color} p-4 rounded-lg text-white mt-6 inline-block`}>
              <p className="text-2xl font-bold">৳{(totalAmount * 1.05 + shippingAmount).toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Receipt Modal */}
      <PaymentReceipt
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          onClose();
          navigate("/my-orders");
        }}
        receiptData={receiptData}
      />
    </div>
  );
};

export default PaymentModal;
