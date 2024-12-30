import { supabase } from '../supabase';
import type { TrainingSession } from './types';

export async function createTrainingSession(userId: string, cpuUsage: number): Promise<TrainingSession> {
  const { data, error } = await supabase
    .from('training_sessions')
    .insert({
      user_id: userId,
      cpu_usage: cpuUsage,
      status: 'active'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function endTrainingSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('training_sessions')
    .update({
      status: 'completed',
      end_time: new Date().toISOString()
    })
    .eq('id', sessionId);

  if (error) throw error;
}