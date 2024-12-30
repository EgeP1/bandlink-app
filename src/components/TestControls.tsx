import React, { useEffect } from 'react';
import { useTimeStore } from '../lib/time';
import { Clock } from 'lucide-react';

export default function TestControls() {
  const { setMockTime, isTestMode, getCurrentTime, incrementTime } = useTimeStore();
  const [displayTime, setDisplayTime] = React.useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTestMode) {
        incrementTime();
        setDisplayTime(getCurrentTime());
      } else {
        setDisplayTime(new Date());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTestMode, getCurrentTime, incrementTime]);

  const setTestTime = () => {
    const now = new Date();
    const testTime = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      0
    ));
    setMockTime(testTime);
    setDisplayTime(testTime);
  };

  const resetTime = () => {
    setMockTime(null);
    setDisplayTime(new Date());
  };

  return (
    <div className="fixed bottom-4 right-4 flex items-center space-x-4 bg-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center space-x-2 text-sm">
        <Clock className="w-4 h-4" />
        <span>
          {displayTime.toLocaleTimeString()} UTC
          {isTestMode && ' (Test Mode)'}
        </span>
      </div>
      <div className="space-x-2">
        <button
          onClick={setTestTime}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          Set to 23:59 UTC
        </button>
        <button
          onClick={resetTime}
          className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
        >
          Reset Time
        </button>
      </div>
    </div>
  );
}