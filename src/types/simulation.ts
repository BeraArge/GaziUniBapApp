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
  id: number; // backend soruId
  prompt: string;
  options: string[];
  optionKeys: string[]; // options ile paralel: ['A','B',...]
  correctIndex: number | null; // null => doğru cevap bilinmiyor
  explanation?: string;
  videoUrl?: string; // soru öncesi izlenecek tam ekran sahne videosu
  videoTranscript?: string; // "Metni Oku" ile gösterilecek metin
};

/** Bir soruya verilen cevabın backend'e gönderilecek kaydı. */
export type AnswerRecord = {
  soruId: number;
  verilenCevap: string; // seçilen şıkkın key'i ('A'..'E')
  cevaplamaSuresiSaniye: number;
  aciklamaOkumaSuresiSaniye: number;
  isCorrect: boolean;
};

/** Sıralama (leaderboard) satırı. */
export type LeaderboardEntry = {
  userId: number;
  fullName: string | null;
  totalScore: number;
  rank: number;
  isCurrentUser: boolean;
};

/** GetCompetitionHome yanıtı: kullanıcının skoru + sıralama. */
export type CompetitionHome = {
  userId: number;
  fullName: string | null;
  totalScore: number;
  rank: number;
  totalParticipantCount: number;
  totalAnswerCount: number;
  correctCount: number;
  wrongCount: number;
  successRate: number;
  statusMessage: string;
  leaderboard: LeaderboardEntry[];
  nearbyUsers: LeaderboardEntry[];
};

export type Step = TextStep | TableStep | VideoStep | QuestionStep;

export type Case = {
  id: string;
  title: string;
  preBriefing: string; // ön bilgilendirme metni
  steps: Step[];
};
