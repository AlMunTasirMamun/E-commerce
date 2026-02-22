// Amarpay Configuration
export const amarpayConfig = {
  // Store ID and Signature Key from Amarpay Dashboard
  storeId: process.env.AMARPAY_STORE_ID || "test_store",
  signatureKey: process.env.AMARPAY_SIGNATURE_KEY || "test_key",
  // API endpoints
  apiUrl: process.env.NODE_ENV === "production" 
    ? "https://secure.amarpay.com" 
    : "https://sandbox.amarpay.com",
  // Callback URLs
  returnUrl: `${process.env.BASE_URL || "http://localhost:5173"}/payment/callback`,
  cancellationUrl: `${process.env.BASE_URL || "http://localhost:5173"}/payment/cancel`,
  failureUrl: `${process.env.BASE_URL || "http://localhost:5173"}/payment/failure`,
};

// Generate Amarpay signature
import crypto from "crypto";

export const generateSignature = (data, signatureKey) => {
  const sortedKeys = Object.keys(data).sort();
  let message = "";
  sortedKeys.forEach((key) => {
    if (data[key]) {
      message += data[key];
    }
  });
  const signature = crypto
    .createHmac("sha512", signatureKey)
    .update(message)
    .digest("hex");
  return signature;
};

// Verify Amarpay callback signature
export const verifySignature = (data, receivedSignature, signatureKey) => {
  const calculatedSignature = generateSignature(data, signatureKey);
  return calculatedSignature === receivedSignature;
};
