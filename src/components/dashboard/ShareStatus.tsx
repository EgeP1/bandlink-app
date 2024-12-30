import React from 'react';
import { Wifi } from 'lucide-react';
import { useExtension } from '../../hooks/useExtension';
import ExtensionPrompt from './ExtensionPrompt';

type ShareStatusProps = {
  isSharing: boolean;
  onToggleShare: () => void;
};

export default function ShareStatus({ isSharing, onToggleShare }: ShareStatusProps) {
  const { status, checking } = useExtension();

  if (checking) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!status.installed) {
    return <ExtensionPrompt />;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${isSharing ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Wifi className={`w-6 h-6 ${isSharing ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Bandwidth Sharing</h2>
            <p className={`text-sm ${isSharing ? 'text-green-600' : 'text-gray-500'}`}>
              {isSharing ? 'Currently sharing' : 'Not sharing'}
            </p>
          </div>
        </div>
        <button
          onClick={onToggleShare}
          className={`px-4 py-2 rounded-lg font-medium ${
            isSharing
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
        >
          {isSharing ? 'Stop Sharing' : 'Start Sharing'}
        </button>
      </div>
    </div>
  );
}