import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL} from '../config';
import {AnswerRecord, CompetitionHome, QuestionStep} from '../types/simulation';
import {logout} from './authSlice';

interface QuestionsMeta {
  partBreakQuestionCount: number;
  ilkPartTamamlandiMi: boolean;
  simulasyonTamamlandiMi: boolean; // true → simülasyon zaten bitmiş
  kalanSoruSayisi: number;
  baslangicIndex: number;
  userId: number | null;
}

interface QuestionsState {
  items: QuestionStep[];
  meta: QuestionsMeta;
  loading: boolean;
  error: string | null;
  loaded: boolean;
  submitting: boolean;
  submitError: string | null;
  competition: CompetitionHome | null;
  competitionLoading: boolean;
  competitionError: string | null;
}

const initialMeta: QuestionsMeta = {
  partBreakQuestionCount: 0,
  ilkPartTamamlandiMi: false,
  simulasyonTamamlandiMi: false,
  kalanSoruSayisi: 0,
  baslangicIndex: 0,
  userId: null,
};

const initialState: QuestionsState = {
  items: [],
  meta: initialMeta,
  loading: false,
  error: null,
  loaded: false,
  submitting: false,
  submitError: null,
  competition: null,
  competitionLoading: false,
  competitionError: null,
};
function mapApiQuestion(q: any): QuestionStep {
  const cevaplar: any[] = Array.isArray(q.cevaplar) ? q.cevaplar : [];
  // Sadece dolu (value'su olan) şıkları al.
  const valid = cevaplar.filter(
    c => c && c.value != null && String(c.value).trim() !== '',
  );
  const options = valid.map(c => String(c.value));
  const optionKeys = valid.map(c => String(c.key));

  // Doğru şıkkın indeksi: dogruCevap.key ile eşleşen şık. dogruCevap yoksa
  // (backend henüz doldurmadıysa) null → o soruda doğru/yanlış gösterilmez.
  const correctKey = q.dogruCevap?.key;
  const foundIndex = valid.findIndex(c => c.key === correctKey);
  const correctIndex = correctKey != null && foundIndex >= 0 ? foundIndex : null;

  // videoPath Windows formatında gelir (videos\\<guid>.mp4) → tam URL.
  const videoUrl = q.videoPath
    ? `${API_URL}/${String(q.videoPath).replace(/\\/g, '/')}`
    : undefined;

  return {
    type: 'question',
    id: q.id,
    prompt: q.soruMetni ?? q.soru ?? '',
    options,
    optionKeys,
    correctIndex,
    explanation: q.dogruCevap?.explanation ?? '',
    videoUrl,
    videoTranscript: q.videoTranscript ?? '',
  };
}

export const fetchQuestions = createAsyncThunk<
  {items: QuestionStep[]; meta: QuestionsMeta},
  void,
  {rejectValue: string}
>('questions/fetchAll', async (_, {getState, rejectWithValue}) => {
  try {
    const auth = (getState() as {auth: {token: string | null; user: any}}).auth;
    const token = auth.token;

    // userId'yi giriş yapan kullanıcıdan dinamik al. Login yanıtındaki `data`
    // (auth.user) içinde kullanıcı id'si `id` alanında döner.
    const userId = auth.user?.id ?? null;
    console.log('GetAllSorus userId:', userId);

    const response = await axios.get(`${API_URL}/api/soru/GetAllSorus`, {
      params: userId != null ? {userId} : undefined,
      headers: token ? {Authorization: `Bearer ${token}`} : undefined,
    });
    console.log('GetAllSorus response:', response.data);

    const payload = response.data;
    if (payload?.isSuccess === false) {
      return rejectWithValue(payload.message ?? 'Sorular alınamadı');
    }

    // Yanıt zarfı: { isSuccess, data: { sorular: [...], ...meta } }
    // Eski dizi formatına da dayanıklı: data dizi ise doğrudan kullan.
    const data = payload?.data ?? {};
    const arr: any[] = Array.isArray(data) ? data : data?.sorular ?? [];

    // id'ye göre artan sırala (1 → 16), sonra eşle.
    const sorted = [...arr].sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0));

    // En az 2 dolu şıkkı olan soruları al (eksik/test kayıtlarını ele).
    const items = sorted.map(mapApiQuestion).filter(q => q.options.length >= 2);

    const meta: QuestionsMeta = {
      partBreakQuestionCount: data?.partBreakQuestionCount ?? 0,
      ilkPartTamamlandiMi: data?.ilkPartTamamlandiMi ?? false,
      simulasyonTamamlandiMi: data?.simulasyonTamamlandiMi ?? false,
      kalanSoruSayisi: data?.kalanSoruSayisi ?? items.length,
      baslangicIndex: data?.baslangicIndex ?? 0,
      userId: data?.userId ?? userId,
    };

    return {items, meta};
  } catch (error: any) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Sorular alınırken bir hata oluştu';
    return rejectWithValue(message);
  }
});

/**
 * Bir part tamamlandığında verilen cevapları backend'e kaydeder:
 * POST /api/soruUser/add  body: { userId, cevaplar: AnswerRecord[] }
 */
export const submitAnswers = createAsyncThunk<
  any,
  {cevaplar: AnswerRecord[]},
  {rejectValue: string}
>('questions/submit', async ({cevaplar}, {getState, rejectWithValue}) => {
  try {
    const auth = (getState() as {auth: {token: string | null; user: any}}).auth;
    const token = auth.token;
    const userId = auth.user?.id ?? null;

    // Backend yalnızca soruId, verilenCevap ve süreleri bekliyor.
    const body = {
      userId,
      cevaplar: cevaplar.map(c => ({
        soruId: c.soruId,
        verilenCevap: c.verilenCevap,
        cevaplamaSuresiSaniye: c.cevaplamaSuresiSaniye,
        aciklamaOkumaSuresiSaniye: c.aciklamaOkumaSuresiSaniye,
      })),
    };
    console.log('soruUser/add body:', body);

    const response = await axios.post(`${API_URL}/api/soruUser/add`, body, {
      headers: token ? {Authorization: `Bearer ${token}`} : undefined,
    });
    console.log('soruUser/add response:', response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Cevaplar kaydedilirken bir hata oluştu';
    return rejectWithValue(message);
  }
});

/**
 * Simülasyon bitiminde skor + sıralama verisini çeker:
 * GET /api/soruUser/GetCompetitionHome?userId=<id>
 */
export const fetchCompetitionHome = createAsyncThunk<
  CompetitionHome,
  void,
  {rejectValue: string}
>('questions/competition', async (_, {getState, rejectWithValue}) => {
  try {
    const auth = (getState() as {auth: {token: string | null; user: any}}).auth;
    const token = auth.token;
    const userId = auth.user?.id ?? null;

    const response = await axios.get(
      `${API_URL}/api/soruUser/GetCompetitionHome`,
      {
        params: userId != null ? {userId} : undefined,
        headers: token ? {Authorization: `Bearer ${token}`} : undefined,
      },
    );
    console.log('GetCompetitionHome response:', response.data);

    const payload = response.data;
    if (payload?.isSuccess === false) {
      return rejectWithValue(payload.message ?? 'Sonuçlar alınamadı');
    }
    return (payload?.data ?? payload) as CompetitionHome;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Sonuçlar alınırken bir hata oluştu';
    return rejectWithValue(message);
  }
});

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchQuestions.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Sorular alınamadı';
      })

      .addCase(submitAnswers.pending, state => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(submitAnswers.fulfilled, state => {
        state.submitting = false;
      })
      .addCase(submitAnswers.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload ?? 'Cevaplar kaydedilemedi';
      })

      .addCase(fetchCompetitionHome.pending, state => {
        state.competitionLoading = true;
        state.competitionError = null;
      })
      .addCase(fetchCompetitionHome.fulfilled, (state, action) => {
        state.competitionLoading = false;
        state.competition = action.payload;
      })
      .addCase(fetchCompetitionHome.rejected, (state, action) => {
        state.competitionLoading = false;
        state.competitionError = action.payload ?? 'Sonuçlar alınamadı';
      })

      // Çıkış yapılınca tüm soru/ilerleme/sonuç durumunu sıfırla; bir sonraki
      // giriş temiz başlasın (eski simulasyonTamamlandiMi/error taşınmasın).
      .addCase(logout, () => initialState);
  },
});

export default questionsSlice.reducer;
