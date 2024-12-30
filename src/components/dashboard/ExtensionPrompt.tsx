import React from 'react';
import { Puzzle } from 'lucide-react';

const EXTENSION_URL = 'https://chrome.google.com/webstore/detail/bandlink-cpu-extension'; // Replace with actual URL

export default function ExtensionPrompt() {
  const handleInstall = () => {
    window.open(EXTENSION_URL, '_blank');
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-blue-100 rounded-full">
          <Puzzle className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900">
            Install Bandlink Extension
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            To start sharing your CPU resources and earning points, please install our secure browser extension.
          </p>
          <button
            onClick={handleInstall}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Install Extension
          </button>
        </div>
      </div>
    </div>
  );
}