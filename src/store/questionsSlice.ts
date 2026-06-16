import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL} from '../config';
import {QuestionStep} from '../types/simulation';

/**
 * Soruları backend'den çeker: GET /api/soru/GetAllSorus
 *
 * Yanıt formatı netleşince mapApiQuestion güncellenecek. Şu an defansif eşleme
 * yapılır ve ham yanıt konsola yazılır (console.log 'GetAllSorus response').
 */

interface QuestionsState {
  items: QuestionStep[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

const initialState: QuestionsState = {
  items: [],
  loading: false,
  error: null,
  loaded: false,
};

/**
 * API soru kaydını QuestionStep'e eşler.
 * Backend formatı:
 *   {
 *     soruMetni: string,
 *     cevaplar: [{ key: 'A', value: '...' }, ...],
 *     dogruCevap: { key: 'A', explanation: '...' },
 *     videoPath, hedef, olcekMaddesi (şimdilik kullanılmıyor)
 *   }
 */
function mapApiQuestion(q: any): QuestionStep {
  const cevaplar: any[] = Array.isArray(q.cevaplar) ? q.cevaplar : [];
  // Sadece dolu (value'su olan) şıkları al.
  const valid = cevaplar.filter(
    c => c && c.value != null && String(c.value).trim() !== '',
  );
  const options = valid.map(c => String(c.value));

  // Doğru şıkkın indeksi: dogruCevap.key ile eşleşen şık.
  const correctKey = q.dogruCevap?.key;
  let correctIndex = valid.findIndex(c => c.key === correctKey);
  if (correctIndex < 0) {
    correctIndex = 0;
  }

  return {
    type: 'question',
    prompt: q.soruMetni ?? q.soru ?? '',
    options,
    correctIndex,
    explanation: q.dogruCevap?.explanation ?? '',
  };
}

export const fetchQuestions = createAsyncThunk<
  QuestionStep[],
  void,
  {rejectValue: string}
>('questions/fetchAll', async (_, {getState, rejectWithValue}) => {
  try {
    const token = (getState() as {auth: {token: string | null}}).auth.token;
    const response = await axios.get(`${API_URL}/api/soru/GetAllSorus`, {
      headers: token ? {Authorization: `Bearer ${token}`} : undefined,
    });
    console.log('GetAllSorus response:', response.data);

    const payload = response.data;
    if (payload?.isSuccess === false) {
      return rejectWithValue(payload.message ?? 'Sorular alınamadı');
    }

    // Yanıt zarfı: { isSuccess, data: [...] }
    const arr: any[] = Array.isArray(payload) ? payload : payload?.data ?? [];

    // En az 2 dolu şıkkı olan soruları al (eksik/test kayıtlarını ele).
    return arr.map(mapApiQuestion).filter(q => q.options.length >= 2);
  } catch (error: any) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Sorular alınırken bir hata oluştu';
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
        state.items = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Sorular alınamadı';
      });
  },
});

export default questionsSlice.reducer;
