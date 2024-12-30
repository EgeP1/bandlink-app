import React from 'react';
import { Cpu, AlertCircle, X } from 'lucide-react';

type CPUConsentModalProps = {
  onAccept: () => void;
  onDecline: () => void;
};

export default function CPUConsentModal({ onAccept, onDecline }: CPUConsentModalProps) {
  const handleFlagRedirect = (flag: string) => {
    window.open(`chrome://flags/#${flag}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-8 space-y-6 relative mx-4 my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onDecline}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>

        <div className="flex items-center space-x-4 pb-2">
          <div className="p-3 bg-blue-100 rounded-full">
            <Cpu className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">CPU Sharing Consent</h2>
        </div>

        <div className="space-y-6">
          <p className="text-gray-600 text-lg">
            Bandlink uses your device's computing power to train AI models when you're sharing. This helps us:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Improve AI model accuracy</li>
            <li>Reduce central computing costs</li>
            <li>Reward you with points for your contribution</li>
          </ul>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-3 flex-1">
                <h3 className="font-semibold text-yellow-800">Required Browser Settings</h3>
                <p className="text-sm text-yellow-700">
                  Enable these Chrome flags to participate:
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => handleFlagRedirect('enable-experimental-webassembly-jspi')}
                    className="w-full text-left px-4 py-3 text-sm bg-white border border-yellow-300 rounded-md hover:bg-yellow-50 transition-colors"
                  >
                    1. Enable WebAssembly JSPI
                  </button>
                  <button
                    onClick={() => handleFlagRedirect('enable-experimental-webassembly-features')}
                    className="w-full text-left px-4 py-3 text-sm bg-white border border-yellow-300 rounded-md hover:bg-yellow-50 transition-colors"
                  >
                    2. Enable WebAssembly Features
                  </button>
                </div>
                <p className="text-xs text-yellow-600">
                  After enabling each flag, you'll need to restart your browser.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Our Commitments:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                <span>We limit CPU usage to maintain device performance</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                <span>Training automatically pauses during heavy system load</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                <span>You can stop sharing at any time</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                <span>Your privacy and security are our top priorities</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
          <button
            onClick={onDecline}
            className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Accept & Enable Sharing
          </button>
        </div>
      </div>
    </div>
  );
}