import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'IBM Plex Sans Arabic', 'system-ui', 'sans-serif']
      },
      colors: {
        // ألوان الحالة — تُستخدم دائماً مع نص/تسمية، لا كمؤشر لوني وحيد (القسم 24)
        status: {
          present: '#0F6E56',
          late: '#854F0B',
          excused: '#5F5E5A',
          unexcused: '#A32D2D'
        }
      }
    }
  },
  plugins: [require('tailwindcss-rtl')]
};

export default config;
