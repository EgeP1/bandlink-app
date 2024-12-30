import React from 'react';
import { Users, Link as LinkIcon, Copy } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useReferralStats } from '../hooks/useReferralStats';
import { generateReferralCode } from '../lib/referrals';
import { formatPoints } from '../utils/formatters';

const Referrals = () => {
  const { user } = useUser();
  const { stats, loading } = useReferralStats(user?.id);
  const [referralLink, setReferralLink] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (user?.id) {
      generateReferralCode().then(setReferralLink);
    }
  }, [user?.id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>

      {/* Referral Link Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <LinkIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Referral Link</h2>
            <p className="text-sm text-gray-500">Share this link to earn bonus points</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 p-2 text-sm bg-gray-50 rounded border border-gray-200"
          />
          <button
            onClick={copyToClipboard}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
        {copied && (
          <p className="text-sm text-green-600 mt-2">
            Copied to clipboard!
          </p>
        )}
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Referrals</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.total_referrals}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Referrals</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.active_referrals}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Points from Referrals</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatPoints(stats.total_points_earned)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Tiers Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Program</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-green-100 rounded-full">
              <span className="text-sm font-semibold text-green-600">T1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Primary Referrals (20%)</h4>
              <p className="text-sm text-gray-500">
                Earn 20% of the points earned by users you directly refer
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <span className="text-sm font-semibold text-blue-600">T2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Secondary Referrals (10%)</h4>
              <p className="text-sm text-gray-500">
                Earn 10% of the points earned by users referred by your referrals
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-purple-100 rounded-full">
              <span className="text-sm font-semibold text-purple-600">T3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Tertiary Referrals (5%)</h4>
              <p className="text-sm text-gray-500">
                Earn 5% of the points earned by users referred by your secondary referrals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;