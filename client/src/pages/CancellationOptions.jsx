import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LiveChat from '../components/LiveChat';

const CancellationOptions = () => {
  const navigate = useNavigate();
  const [showLiveChat, setShowLiveChat] = useState(false);
  return (
    <>
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Cancellation & Return Policy
          </h1>
          <p className="text-lg text-gray-600">We want you to be satisfied with your purchase</p>
        </div>

        {/* Cancellation Timeline */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Cancellation Timeline</h2>
          <div className="space-y-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <h3 className="font-bold text-green-700 mb-2">Before Shipment (Free Cancellation)</h3>
              <p className="text-gray-700 text-sm">Cancel anytime before your order ships. Full refund within 2-3 business days.</p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <h3 className="font-bold text-yellow-700 mb-2">After Shipment (7 Days Return Window)</h3>
              <p className="text-gray-700 text-sm">Return unopened items within 7 days of delivery. Include original packaging and receipt.</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <h3 className="font-bold text-red-700 mb-2">After 7 Days</h3>
              <p className="text-gray-700 text-sm">No returns accepted. Contact customer support for damaged or defective items.</p>
            </div>
          </div>
        </div>

        {/* Time-Based Refund Policy Table */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Time-Based Refund Policy</h2>
          <p className="text-gray-600 mb-4">
            The refund amount depends on how much time has passed since your order was placed. 
            <span className="text-red-600 font-medium"> Note: Tax (2%) is non-refundable.</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Time Since Order</th>
                  <th className="px-6 py-4 text-center font-semibold">Deduction</th>
                  <th className="px-6 py-4 text-center font-semibold">Refund Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-green-50 hover:bg-green-100 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">Within 1 hour</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">0%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">100%</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">1-6 hours</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">5%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">95%</span>
                  </td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">6-24 hours</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">10%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">90%</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">24-48 hours</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">15%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-semibold">85%</span>
                  </td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">2-3 days</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">20%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-semibold">80%</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">3-7 days</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">30%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-semibold">70%</span>
                  </td>
                </tr>
                <tr className="bg-red-50 hover:bg-red-100 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">After 7 days</td>
                  <td className="px-6 py-4 text-center" colSpan="2">
                    <span className="px-4 py-1.5 bg-red-600 text-white rounded-full text-sm font-semibold">
                      ❌ Refund Not Accepted
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>⚠️ Important:</strong> Refund requests are <strong>only accepted within 7 days</strong> of placing your order. 
              After 7 days, no refunds will be processed.
            </p>
          </div>
          <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>💡 Tip:</strong> Request your refund as early as possible to maximize your refund amount. 
              Refunds are calculated based on the <strong>product price only</strong> — the 2% tax is not included in the refundable amount.
            </p>
          </div>
        </div>

        {/* How to Cancel */}
        <div className="mb-12 bg-indigo-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Cancel Your Order</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600 text-white font-bold">1</div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Go to My Orders</h3>
                <p className="text-gray-600 text-sm">Log into your account and navigate to "My Orders"</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600 text-white font-bold">2</div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Select Order to Cancel</h3>
                <p className="text-gray-600 text-sm">Find the order you want to cancel and click on it</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600 text-white font-bold">3</div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Click Cancel Order</h3>
                <p className="text-gray-600 text-sm">Click the "Cancel Order" button (only available before shipment)</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600 text-white font-bold">4</div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Confirm & Get Refund</h3>
                <p className="text-gray-600 text-sm">Confirm cancellation. Refund will be processed within 2-3 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Return Instructions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Return Items</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">✓ Items Must Be:</h3>
              <ul className="text-gray-700 text-sm space-y-1 ml-4">
                <li>• Unused and in original condition</li>
                <li>• In original packaging with all tags attached</li>
                <li>• Returned within 7 days of delivery</li>
                <li>• Accompanied by proof of purchase</li>
              </ul>
            </div>
            <hr className="my-4" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">✗ Non-Returnable Items:</h3>
              <ul className="text-gray-700 text-sm space-y-1 ml-4">
                <li>• Items damaged due to customer misuse</li>
                <li>• Personalized or customized products</li>
                <li>• Perishable items (unless damaged/defective)</li>
                <li>• Items without original packaging</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Refund Process */}
        <div className="mb-12 bg-purple-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Process</h2>
          <div className="space-y-3">
            <p className="text-gray-700"><strong>Time-Based Calculation:</strong> Refund amount varies based on when you request it (see table above)</p>
            <p className="text-gray-700"><strong>Tax Non-Refundable:</strong> The 2% tax on your order is not included in refunds</p>
            <p className="text-gray-700"><strong>Processing Time:</strong> Refunds are processed within 3-5 business days after approval</p>
            <p className="text-gray-700"><strong>Return to Account:</strong> Amount will be credited back to your original payment method</p>
            <p className="text-gray-700"><strong>Notification:</strong> You'll receive a notification when your refund is approved or rejected</p>
          </div>
        </div>

        {/* Special Cases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Damaged or Defective Items</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">If you receive a damaged or defective item:</p>
            <ol className="text-gray-700 space-y-3 ml-4">
              <li><strong>1.</strong> Report within 48 hours of delivery</li>
              <li><strong>2.</strong> Provide photos of the damage/defect</li>
              <li><strong>3.</strong> We'll arrange a replacement or refund</li>
              <li><strong>4.</strong> No return shipping cost for defective items</li>
            </ol>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Need to cancel or return?</h3>
          <p className="mb-4">Contact our support team for assistance</p>
          <button onClick={() => setShowLiveChat(true)} className="px-6 py-2 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition">
            Contact Support
          </button>
        </div>
      </div>
    </div>

    <LiveChat isOpen={showLiveChat} onClose={() => setShowLiveChat(false)} />
    </>
  );
};

export default CancellationOptions;
