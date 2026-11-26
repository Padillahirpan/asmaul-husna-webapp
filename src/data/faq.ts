export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Pertanyaan umum tentang Asmaul Husna.
 * Digunakan bersama oleh halaman Direktori Publik (`/`) dan skema JSON-LD `FAQPage`.
 */
export const ASMAUL_HUSNA_FAQ: readonly FaqItem[] = [
  {
    question: 'Apa itu Asmaul Husna?',
    answer:
      'Asmaul Husna berasal dari bahasa Arab yang berarti nama-nama yang paling baik dan indah. Istilah ini merujuk pada nama-nama agung Allah SWT yang mencerminkan sifat kesempurnaan-Nya sebagaimana disebutkan dalam Al-Qur’an dan hadis.',
  },
  {
    question: 'Berapa jumlah Asmaul Husna?',
    answer:
      'Jumlah Asmaul Husna yang populer dihafal adalah 99 nama berdasarkan hadis riwayat al-Bukhari dan Muslim. Adapun menurut mayoritas ulama Ahlus Sunnah, nama-nama Allah tidak terbatas pada 99 nama tersebut.',
  },
  {
    question: 'Dari mana urutan 99 Asmaul Husna pada daftar ini berasal?',
    answer:
      'Urutan 99 nama pada halaman ini mengikuti riwayat at-Tirmidzi (no. 3507) yang paling luas dikenal masyarakat. Para ulama hadis menjelaskan bahwa perincian nama dalam riwayat tersebut memiliki kelemahan dari sisi sanad, sedangkan hadis Bukhari dan Muslim menyebutkan jumlahnya tanpa merinci daftarnya.',
  },
  {
    question: 'Bagaimana cara menghafal 99 Asmaul Husna agar tidak mudah lupa?',
    answer:
      'Riset pembelajaran menunjukkan bahwa menguji ingatan secara aktif (retrieval practice) dan mencicil materi secara bertahap jauh lebih efektif daripada sekadar membaca berulang. Anda dapat menggunakan fitur Latihan di situs ini untuk menghafal per 15 nama sambil memahami artinya.',
  },
];
