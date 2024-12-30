import { supabase } from '../supabase';

interface TrainingContribution {
  batchSize: number;
  loss: number;
  accuracy: number;
  trainingTime: number;
  cpuUsage: number;
}

export async function startTrainingSession(cpuUsage: number) {
  const { data, error } = await supabase
    .from('training_sessions')
    .insert({
      cpu_usage: cpuUsage,
      status: 'active'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function endTrainingSession(sessionId: string) {
  const { error } = await supabase
    .from('training_sessions')
    .update({
      end_time: new Date().toISOString(),
      status: 'completed'
    })
    .eq('id', sessionId);

  if (error) throw error;
}

export async function recordTrainingContribution(
  sessionId: string,
  contribution: TrainingContribution
) {
  const { error } = await supabase
    .from('training_contributions')
    .insert({
      session_id: sessionId,
      batch_size: contribution.batchSize,
      loss: contribution.loss,
      accuracy: contribution.accuracy,
      training_time: contribution.trainingTime,
      cpu_usage: contribution.cpuUsage
    });

  if (error) throw error;
}