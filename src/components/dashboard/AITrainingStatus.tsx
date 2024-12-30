import React from 'react';
import { Cpu } from 'lucide-react';
import { useSharing } from '../../hooks/useSharing';

export default function AITrainingStatus() {
  const { isSharing } = useSharing();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${isSharing ? 'bg-green-100' : 'bg-gray-100'}`}>
          <Cpu className={`w-6 h-6 ${isSharing ? 'text-green-600' : 'text-gray-600'}`} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI Training Status</h2>
          <p className={`text-sm ${isSharing ? 'text-green-600' : 'text-gray-500'}`}>
            {isSharing ? 'Contributing to AI training' : 'Training paused'}
          </p>
        </div>
      </div>
      {isSharing && (
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Your device is helping train AI models while maintaining optimal performance
          </p>
        </div>
      )}
    </div>
  );
}