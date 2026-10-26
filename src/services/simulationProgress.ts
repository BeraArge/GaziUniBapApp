import AsyncStorage from '@react-native-async-storage/async-storage';

export type SimulationProgress = {
  lastCompletedStepId: number;
  lastCompletedOrder: number;
};

const keyFor = (userId: number) => `simulation-progress:v1:user:${userId}`;

export async function getSimulationProgress(userId: number): Promise<SimulationProgress | null> {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  if (!raw) return null;
  const parsed = JSON.parse(raw) as SimulationProgress;
  if (!Number.isFinite(parsed.lastCompletedStepId) || !Number.isFinite(parsed.lastCompletedOrder)) {
    throw new Error('Kaydedilmiş simülasyon ilerlemesi geçersiz.');
  }
  return parsed;
}

export async function saveSimulationProgress(userId: number, stepId: number, order: number): Promise<void> {
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify({
    lastCompletedStepId: stepId,
    lastCompletedOrder: order,
  } satisfies SimulationProgress));
}

export async function clearSimulationProgress(userId: number): Promise<void> {
  await AsyncStorage.removeItem(keyFor(userId));
}
