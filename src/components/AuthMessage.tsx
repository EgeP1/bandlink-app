import React from 'react';
import { AuthErrorType } from '../lib/auth';

type AuthMessageProps = {
  error?: AuthErrorType;
  success?: string;
};

export default function AuthMessage({ error, success }: AuthMessageProps) {
  if (!error && !success) return null;

  if (success) {
    return (
      <div className="rounded-md bg-green-50 p-4">
        <div className="text-sm text-green-700">{success}</div>
      </div>
    );
  }

  return (
    <div className={`rounded-md ${error.type === 'warning' ? 'bg-yellow-50' : 'bg-red-50'} p-4`}>
      <div className={`text-sm ${error.type === 'warning' ? 'text-yellow-700' : 'text-red-700'}`}>
        {error.message}
      </div>
    </div>
  );
}