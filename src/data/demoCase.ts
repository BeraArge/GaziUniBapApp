import {Case} from '../types/simulation';

/**
 * VAKA 1 — Diyabetik Ayak / Ayşe Gündüz
 *
 * Bu dosya yalnızca vakanın STATİK tanım adımlarını içerir (vaka tanımı, tablolar,
 * değerlendirmeler, senaryo sahnesi). SORULAR artık API'den (/api/soru/GetAllSorus)
 * çekilir ve SimulationScreen tarafından bu adımların sonuna eklenir
 * (bkz. src/store/questionsSlice.ts).
 */
export const demoCase: Case = {
  id: 'vaka-1',
  title: 'Vaka ',
  preBriefing:
    'Bu simülasyon, sizlerin hasta güvenliği yetkinliklerine ilişkin öz değerlendirme ' +
    'düzeylerinizi geliştirmeyi amaçlamaktadır. Senaryoda yer alan sahneler, gerçek klinik ' +
    'uygulamalar temel alınarak oluşturulmuş olup öğrenme sürecini desteklemek üzere ' +
    'interaktif simülasyon teknikleriyle yapılandırılmıştır.\n\n' +
    'Sizlerden beklenen, senaryoları dikkatli bir şekilde izlemek ve senaryo akışı sırasında ' +
    'ekranda belirecek olan soruları okuyarak doğru şekilde yanıtlamaktır.\n\n' +
    'Oyunu başlatmak için size gönderilen linke tıklayarak oyunu açınız.\n\n' +
    'Başlamadan önce, öğrenci numaranızı eksiksiz ve doğru bir şekilde girdiğinizden emin ' +
    'olunuz. Ardından kendinize ait bir kod isim belirleyiniz ve ekrandaki ilgili yere kod ' +
    'isminizi yazınız ve “Başla” butonuna tıklayarak simülasyona geçiş yapabilirsiniz.\n\n' +
    'Simülasyon içerisinde toplam 16 soru yer almaktadır.\n\n' +
    'Sorulara doğru yanıt verdiğinizde, bunun doğru bir cevap olduğu ekranda belirtilecek ve ' +
    'ilgili sorudan tam puan alacaksınız. Simülasyon uygulamasında bir sahne bitmeden ' +
    'diğerine geçilemeyecektir.\n\n' +
    'Tüm simülasyonu bir kez uygulayacaksınız.\n\n' +
    'Simülasyon sahneleri ve soruları tüm aşamalarıyla tamamlamadan çıkarsanız ilerlemeniz ' +
    'kaydedilmeyecektir. Bu nedenle, lütfen tüm sahneleri bitirmeden simülasyondan ' +
    'ayrılmayınız.',
  steps: [
    // 1) Vaka Tanımı + hasta öyküsü
    {
      type: 'text',
      title: 'Vaka Tanımı',
      patient: {
        fullName: 'Ayşe Gündüz',
        protocolNo: '7362482',
        date: '01.05.2026',
        age: '48',
        gender: 'Kadın',
      },
      body:
        '“Merhaba ben Merve Hemşire. Genel Cerrahi Servisi’nde servis hemşiresi olarak ' +
        'çalışıyorum. 24 saatlik nöbetimi ve bakım ve tedavi sürecinden sorumlu olduğum ' +
        'hastaları az önce devraldım. Şimdi sizlere, Ayşe Gündüz isimli hastamın bilgilerini ' +
        'aktaracağım.”\n\n' +
        'Hastanın Öyküsü:\n' +
        'Ayşe Gündüz, 48 yaşında, ilkokul mezunu ve emeklidir. Boyu 156 cm, kilosu 78 kg’dır. ' +
        'Beden Kitle İndeksi (BKİ) 32 olup, birinci derece obez sınıfında yer almaktadır. ' +
        'Hastanın bilinen alerjisi bulunmamaktadır. Sigara ve alkol kullanımı yoktur. ' +
        'Bulaşıcı hastalığı bulunmamaktadır. Ayşe Gündüz’ün 10 yıllık Tip 2 diyabet ve ' +
        '5 yıllık hipertansiyon öyküsü mevcuttur. Hastanın sol ayak başparmağı altındaki ' +
        'metatarsal bölgede diyabetik ayak yarası bulunmaktadır.\n\n' +
        'Hasta, yaklaşık bir haftadır sol ayağında giderek artan ağrı ve hassasiyet, yara ' +
        'çevresinde kızarıklık, kötü koku ve akıntı gelişmesi nedeniyle acil servise ' +
        'başvurmuştur. Acil serviste yapılan değerlendirmede lokal enfeksiyon bulguları ' +
        'saptanmış olup, hastanın mevcut durumu nedeniyle Enfeksiyon Hastalıkları ve Genel ' +
        'Cerrahi bölümlerinden konsültasyon istenmiş, yapılan değerlendirme sonucunda ' +
        'manyetik rezonans (MR) incelemesi ve Doppler ultrasonografi tetkikleri ' +
        'planlanmıştır. MR incelemesinde sol ayak 1. metatars başında sınırlı osteomiyelit ' +
        'ile uyumlu bulgular saptanırken, Doppler ultrasonografide kritik iskemi ' +
        'izlenmemiştir.\n\n' +
        'Hastaya, cerrahi olarak yara temizliği (debridman) ve enfekte kemik dokusunun ' +
        'çıkarılması (rezeksiyon) operasyonu planlanmıştır. Bu doğrultuda hasta 1 Mayıs 2026 ' +
        'tarihinde Genel Cerrahi Servisi’ne yatırılmıştır. Hasta şu an yatışının 4. ' +
        'günündedir.\n\n' +
        'Hastanın 4×1 kan basıncı ve 4×1 kan şekeri takibi planlanmış olup; diyabetik, ' +
        'proteinli ve tuzsuz diyet uygulanmaktadır. Hastanın hemoglobin düzeyinin 6.8 g/dL ' +
        'olduğu saptanmış, preoperatif dönemde doku oksijenlenmesini desteklemek amacıyla ' +
        'eritrosit süspansiyonu transfüzyonu planlanmıştır.',
    },

    // 2) İlaç İstemi
    {
      type: 'table',
      title: 'İlaç İstemi',
      columns: ['Adı', 'Sıklık', 'Uygulama Saati', 'Kullanma Nedeni'],
      rows: [
        [
          'Lantus (Bazal etkili insülin analoğu)',
          '1 x 1 (S.C.)',
          'Gece yatmadan önce (23:00)',
          'Kan şekeri regülasyonu',
        ],
        [
          'Novarapid (Hızlı etkili insülin analoğu)',
          '3 x 1 (S.C.)',
          'Yemeklerden önce',
          'Kan şekeri regülasyonu',
        ],
        [
          'Ramipril 2.5 mg Tablet',
          '2 x 1 (P.O.)',
          '12:00 - 00:00',
          'Kan basıncının düzenlenmesi',
        ],
        [
          'Eritrosit Süspansiyonu',
          '1 x 1',
          '07:30 (Merve Hemşirenin nöbeti teslim almasına yakın saatte Büşra Hemşire tarafından takılmış olacak)',
          'Hb < 7 mg/dl ve preoperatif dönemde olması nedeniyle',
        ],
        [
          'Tekosit 400 mg Flakon',
          '1 x 500 mg (IV inf.)',
          '10:00',
          'Osteomyelit tedavisi',
        ],
        [
          'Cipro 750 mg P.O.',
          '2 x 750 mg (P.O.)',
          '06:00 - 18:00',
          'Osteomyelit tedavisi',
        ],
        [
          'Parol 10 mg/ml Flakon',
          '2 x 1 (IV İnf.)',
          '14:00 - 02:00',
          'Diyabetik ayak ağrı tedavisi',
        ],
        [
          'Pregabalin 75 mg Kapsül',
          '2 x 75 mg (P.O.)',
          '09:00 - 21:00',
          'Diyabetik nöropati tedavisi',
        ],
        [
          'Gümüşlü Hidrofiber Yara Örtüsü',
          '2 günde 1 (Topikal)',
          '21:00',
          'Antimikrobiyal bariyer oluşturma',
        ],
      ],
    },

    // 3) Yaşamsal Bulgular
    {
      type: 'table',
      title: 'Yaşamsal Bulgular',
      columns: [
        'Zaman',
        'Kan Basıncı',
        'Nabız',
        'Solunum',
        'Vücut Sıcaklığı',
        'Ağrı (0-10)',
      ],
      rows: [
        ['14.03.2026 08:30', '126/86 mmHg (monitör ile)', '94/dk', '22/dk', '36,8 °C', '0'],
        ['14.03.2026 09:00', '128/82 mmHg (monitör ile)', '88/dk', '20/dk', '36,4 °C', '0'],
        ['14.03.2026 09:30', '130/84 mmHg (monitör ile)', '86/dk', '20/dk', '36,6 °C', '0'],
        ['14.03.2026 12:00', '150/95 mmHg', '104/dk', '24/dk', '38,6 °C', '5'],
        ['14.03.2026 14:00', '124/76 mmHg', '100/dk', '22/dk', '36,5 °C', '5'],
        ['14.03.2026 16:00', '130/85 mmHg', '96/dk', '22/dk', '36,8 °C', '7'],
        ['14.03.2026 17:00', '130/80 mmHg', '-', '-', '-', '4'],
        ['15.03.2026 00:00', '150/95 mmHg', '94/dk', '18/dk', '36,4 °C', '3'],
        ['15.03.2026 07:00 (operasyon sabahı)', '135/85 mmHg', '74/dk', '16/dk', '36 °C', '0'],
      ],
      note: 'Ağrı: Tek Boyutlu Sayısal Ağrı Şiddeti Ölçeği (0-10) ile değerlendirilmiştir.',
    },

    // 4) Kan Glikoz Düzeyleri
    {
      type: 'table',
      title: 'Kan Glikoz Düzeyleri',
      columns: ['Zaman', 'Kan Şekeri'],
      rows: [
        ['14.03.2026 12:00', '90 mg/dl'],
        ['14.03.2026 17:00', '95 mg/dl'],
        ['14.03.2026 22:00', '220 mg/dl'],
        ['15.03.2026 07:00', '95 mg/dl'],
      ],
    },

    // 5) Laboratuvar Bulguları
    {
      type: 'table',
      title: 'Laboratuvar Bulguları',
      columns: ['Tarih', 'İşlem Adı', 'Normal Aralık', 'Hastanın Değeri'],
      rows: [
        ['10.03.2026', 'WBC', '4–11 ×10³/µL', '11.4 ×10³/µL ↑'],
        ['10.03.2026', 'Nötrofil (%)', '% 40-70', '% 83 ↑'],
        ['10.03.2026', 'ESR (Eritrosit Sedimantasyon Hızı)', '0-20 mm/saat', '50 mm/saat ↑'],
        ['10.03.2026', 'CRP (C-reaktif protein)', '0-0.5 mg/dL', '20 mg/L ↑'],
        ['10.03.2026', 'Glukoz (Açlık)', '70-100 mg/dl', '150 mg/dl ↑'],
        ['10.03.2026', 'Glike Hemoglobin (HbA1C)', '% 4,7-5,6', '% 7 ↑'],
        ['10.03.2026', 'pH', '7.35-7.45', '7.40'],
        ['10.03.2026', 'Üre', '7-20 mg/dl', '8 mg/dl'],
        ['10.03.2026', 'Kreatinin', '0.6-1.2 mg/dl', '0.8 mg/dl'],
        ['10.03.2026', 'Kreatinin klirensi (Clcr)', '88-128 ml/dk', '100 ml/dk'],
        ['10.03.2026', 'Sodyum (Na)', '135-145 mmol/L', '140 mmol/L'],
        ['10.03.2026', 'Potasyum (K)', '3.5-5.0 mmol/L', '4.42 mmol/L'],
        ['10.03.2026', 'Kalsiyum (Ca)', '8.5-10.5 mg/dL', '9.10 mg/dL'],
        ['10.03.2026', 'Total protein', '60-80 g/L', '61.5 g/L'],
        ['10.03.2026', 'Albümin', '35-50 g/L', '30 g/L ↓'],
        ['10.03.2026', 'RBC', '4.7–6.1 M/µL', '2.95 M/µL ↓'],
        ['10.03.2026', 'HGB', '12.0-15.5 g/dl', '6.8 g/dl ↓'],
        ['10.03.2026', 'HCT', '% 35-45', '% 20.1 ↓'],
        ['10.03.2026', 'Serum Demir (Fe)', '50-170 µg/dL', '30 µg/dl ↓'],
        ['10.03.2026', 'Serum Ferritin', '30-300 ng/mL', '400 ng/ml ↑'],
        ['10.03.2026', 'APTT', '25-35 sn.', '45 sn. ↑'],
        ['10.03.2026', 'INR', '0.8-1.2', '1.78 ↑'],
      ],
      note: '↑ yüksek, ↓ düşük değerleri gösterir.',
    },

    // 6) Düşme Riski Değerlendirmesi
    {
      type: 'text',
      title: 'Düşme Riski Değerlendirmesi',
      body:
        'MORSE Düşme Riski Ölçeği ile yapılan değerlendirmede hastanın ölçek toplam puanı ' +
        '45 olup, risk düzeyi yüksektir.',
    },

    // 7) Ağrı Değerlendirmesi
    {
      type: 'text',
      title: 'Ağrı Değerlendirmesi',
      body:
        '0–10 arasında değerlendirilen Sayısal Derecelendirme Ölçeği’ne göre hastanın sol ' +
        'ayağında 5 düzeyinde (orta şiddette) ağrı olduğu belirlenmiş; ağrının zonklayıcı ve ' +
        'yanıcı karakterde olduğu saptanmıştır.',
    },

    // 8) Diyabetik Ayak Yara Sınıflandırması
    {
      type: 'text',
      title: 'Diyabetik Ayak Yara Sınıflandırması',
      body:
        'Uluslararası Diyabetik Ayak Çalışma Grubu (IWGDF, 2023)’na göre hastanın diyabetik ' +
        'ayak yarası 2. Evre olarak sınıflandırılmıştır: metatars başında sınırlı osteomiyelit ' +
        'ile birlikte, 2 cm’den büyük, eritemli ve deri altı dokulara uzanan lokal enfeksiyon.',
    },

    // Sorular buradan sonra API'den (/api/soru/GetAllSorus) eklenir. Her soru
    // kendi sahne videosuyla (videoPath) tam ekran sunulur (bkz. SceneStep).
  ],
};
