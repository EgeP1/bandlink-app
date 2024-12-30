import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useRewards } from '../../hooks/useRewards';

type Reward = {
  id: string;
  title: string;
  points_required: number;
  image_url: string;
};

type RewardsListProps = {
  availablePoints: number;
};

export default function RewardsList({ availablePoints }: RewardsListProps) {
  const rewards = useRewards();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {rewards.map((reward: Reward) => (
        <div key={reward.id} className="bg-white rounded-lg shadow overflow-hidden">
          <img
            src={reward.image_url}
            alt={reward.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">{reward.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {reward.points_required.toLocaleString()} points
            </p>
            <button
              disabled={availablePoints < reward.points_required}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Redeem</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}