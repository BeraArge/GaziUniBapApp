
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
  videoUrl?: string;

  // Eski bileşenlerle uyumluluk için geçici olarak korunuyor.
  transcript: string;

  id?: number;
  order?: number;

  beklemeSuresi?: number;
  bildirimMetni?: string | null;
  partArasiMi?: boolean;
};

export type NotificationStep = {
  type: 'notification';
  id: number;
  order: number;
  message: string;
};

export type QuestionStep = {
  type: 'question';
  id: number;
  order?: number;

  prompt: string;
  options: string[];
  optionKeys: string[];
  optionExplanations?: Record<string, string>;

  correctIndex: number | null;
  explanation?: string;

  videoUrl?: string;
  videoTranscript?: string;

  beklemeSuresi?: number;
  bildirimMetni?: string | null;
  partArasiMi?: boolean;

  isOpenEnded?: boolean;
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

export type Step =
  | TextStep
  | TableStep
  | VideoStep
  | QuestionStep
  | NotificationStep;

export type Case = {
  id: string;
  title: string;
  preBriefing: string; // ön bilgilendirme metni
  steps: Step[];
};
