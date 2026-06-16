/**
 * Vaka simülasyonu için veri tipleri.
 * Bir vaka (Case), sıralı adımlardan (Step) oluşur. SimulationScreen bu adımları
 * tipine göre uygun bileşene yönlendirerek sırayla gösterir.
 */

export type PatientInfo = {
  fullName: string; // Ad Soyad
  protocolNo: string; // Protokol No
  date: string; // Tarih
  age?: string;
  gender?: string;
};

export type TextStep = {
  type: 'text';
  title: string;
  body: string;
  patient?: PatientInfo;
};

export type TableStep = {
  type: 'table';
  title: string;
  columns: string[];
  rows: string[][];
  note?: string;
};

export type VideoStep = {
  type: 'video';
  title: string;
  videoUrl?: string; // şimdilik placeholder; gerçek oynatıcı sonra
  transcript: string; // "Metni Oku" ile gösterilecek öykü metni
};

export type QuestionStep = {
  type: 'question';
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type Step = TextStep | TableStep | VideoStep | QuestionStep;

export type Case = {
  id: string;
  title: string;
  preBriefing: string; // ön bilgilendirme metni
  steps: Step[];
};
