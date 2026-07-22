import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * بيانات مرجعية للسور الـ١١٤: الاسم وعدد الآيات معروفة ومستقرة (رواية حفص).
 *
 * ASSUMPTION: أرقام juzStart/juzEnd هنا تقريبية على مستوى "السورة" (أي رقم الجزء
 * الذي تبدأ/تنتهي فيه السورة)، وليست على مستوى الآية الدقيقة — لأن بعض الأجزاء
 * تنقسم داخل السورة نفسها. قبل الاعتماد عليها في حسابات دقيقة (مثل "متبقٍّ لختم
 * الجزء")، يجب التحقق منها مقابل مصدر موثوق مثل بيانات مجمع الملك فهد لطباعة
 * المصحف الشريف، طبقاً للقسم 5 من تعليمات المشروع ("قائمة سور موثّقة").
 */
const surahs = [
  { number: 1, nameAr: 'الفاتحة', verseCount: 7, juzStart: 1, juzEnd: 1 },
  { number: 2, nameAr: 'البقرة', verseCount: 286, juzStart: 1, juzEnd: 3 },
  { number: 3, nameAr: 'آل عمران', verseCount: 200, juzStart: 3, juzEnd: 4 },
  { number: 4, nameAr: 'النساء', verseCount: 176, juzStart: 4, juzEnd: 6 },
  { number: 5, nameAr: 'المائدة', verseCount: 120, juzStart: 6, juzEnd: 7 },
  { number: 6, nameAr: 'الأنعام', verseCount: 165, juzStart: 7, juzEnd: 8 },
  { number: 7, nameAr: 'الأعراف', verseCount: 206, juzStart: 8, juzEnd: 9 },
  { number: 8, nameAr: 'الأنفال', verseCount: 75, juzStart: 9, juzEnd: 10 },
  { number: 9, nameAr: 'التوبة', verseCount: 129, juzStart: 10, juzEnd: 11 },
  { number: 10, nameAr: 'يونس', verseCount: 109, juzStart: 11, juzEnd: 11 },
  { number: 11, nameAr: 'هود', verseCount: 123, juzStart: 11, juzEnd: 12 },
  { number: 12, nameAr: 'يوسف', verseCount: 111, juzStart: 12, juzEnd: 13 },
  { number: 13, nameAr: 'الرعد', verseCount: 43, juzStart: 13, juzEnd: 13 },
  { number: 14, nameAr: 'إبراهيم', verseCount: 52, juzStart: 13, juzEnd: 13 },
  { number: 15, nameAr: 'الحجر', verseCount: 99, juzStart: 14, juzEnd: 14 },
  { number: 16, nameAr: 'النحل', verseCount: 128, juzStart: 14, juzEnd: 14 },
  { number: 17, nameAr: 'الإسراء', verseCount: 111, juzStart: 15, juzEnd: 15 },
  { number: 18, nameAr: 'الكهف', verseCount: 110, juzStart: 15, juzEnd: 16 },
  { number: 19, nameAr: 'مريم', verseCount: 98, juzStart: 16, juzEnd: 16 },
  { number: 20, nameAr: 'طه', verseCount: 135, juzStart: 16, juzEnd: 16 },
  { number: 21, nameAr: 'الأنبياء', verseCount: 112, juzStart: 17, juzEnd: 17 },
  { number: 22, nameAr: 'الحج', verseCount: 78, juzStart: 17, juzEnd: 17 },
  { number: 23, nameAr: 'المؤمنون', verseCount: 118, juzStart: 18, juzEnd: 18 },
  { number: 24, nameAr: 'النور', verseCount: 64, juzStart: 18, juzEnd: 18 },
  { number: 25, nameAr: 'الفرقان', verseCount: 77, juzStart: 18, juzEnd: 19 },
  { number: 26, nameAr: 'الشعراء', verseCount: 227, juzStart: 19, juzEnd: 19 },
  { number: 27, nameAr: 'النمل', verseCount: 93, juzStart: 19, juzEnd: 20 },
  { number: 28, nameAr: 'القصص', verseCount: 88, juzStart: 20, juzEnd: 20 },
  { number: 29, nameAr: 'العنكبوت', verseCount: 69, juzStart: 20, juzEnd: 21 },
  { number: 30, nameAr: 'الروم', verseCount: 60, juzStart: 21, juzEnd: 21 },
  { number: 31, nameAr: 'لقمان', verseCount: 34, juzStart: 21, juzEnd: 21 },
  { number: 32, nameAr: 'السجدة', verseCount: 30, juzStart: 21, juzEnd: 21 },
  { number: 33, nameAr: 'الأحزاب', verseCount: 73, juzStart: 21, juzEnd: 22 },
  { number: 34, nameAr: 'سبأ', verseCount: 54, juzStart: 22, juzEnd: 22 },
  { number: 35, nameAr: 'فاطر', verseCount: 45, juzStart: 22, juzEnd: 22 },
  { number: 36, nameAr: 'يس', verseCount: 83, juzStart: 22, juzEnd: 23 },
  { number: 37, nameAr: 'الصافات', verseCount: 182, juzStart: 23, juzEnd: 23 },
  { number: 38, nameAr: 'ص', verseCount: 88, juzStart: 23, juzEnd: 23 },
  { number: 39, nameAr: 'الزمر', verseCount: 75, juzStart: 23, juzEnd: 24 },
  { number: 40, nameAr: 'غافر', verseCount: 85, juzStart: 24, juzEnd: 24 },
  { number: 41, nameAr: 'فصلت', verseCount: 54, juzStart: 24, juzEnd: 25 },
  { number: 42, nameAr: 'الشورى', verseCount: 53, juzStart: 25, juzEnd: 25 },
  { number: 43, nameAr: 'الزخرف', verseCount: 89, juzStart: 25, juzEnd: 25 },
  { number: 44, nameAr: 'الدخان', verseCount: 59, juzStart: 25, juzEnd: 25 },
  { number: 45, nameAr: 'الجاثية', verseCount: 37, juzStart: 25, juzEnd: 25 },
  { number: 46, nameAr: 'الأحقاف', verseCount: 35, juzStart: 26, juzEnd: 26 },
  { number: 47, nameAr: 'محمد', verseCount: 38, juzStart: 26, juzEnd: 26 },
  { number: 48, nameAr: 'الفتح', verseCount: 29, juzStart: 26, juzEnd: 26 },
  { number: 49, nameAr: 'الحجرات', verseCount: 18, juzStart: 26, juzEnd: 26 },
  { number: 50, nameAr: 'ق', verseCount: 45, juzStart: 26, juzEnd: 26 },
  { number: 51, nameAr: 'الذاريات', verseCount: 60, juzStart: 26, juzEnd: 27 },
  { number: 52, nameAr: 'الطور', verseCount: 49, juzStart: 27, juzEnd: 27 },
  { number: 53, nameAr: 'النجم', verseCount: 62, juzStart: 27, juzEnd: 27 },
  { number: 54, nameAr: 'القمر', verseCount: 55, juzStart: 27, juzEnd: 27 },
  { number: 55, nameAr: 'الرحمن', verseCount: 78, juzStart: 27, juzEnd: 27 },
  { number: 56, nameAr: 'الواقعة', verseCount: 96, juzStart: 27, juzEnd: 27 },
  { number: 57, nameAr: 'الحديد', verseCount: 29, juzStart: 27, juzEnd: 27 },
  { number: 58, nameAr: 'المجادلة', verseCount: 22, juzStart: 28, juzEnd: 28 },
  { number: 59, nameAr: 'الحشر', verseCount: 24, juzStart: 28, juzEnd: 28 },
  { number: 60, nameAr: 'الممتحنة', verseCount: 13, juzStart: 28, juzEnd: 28 },
  { number: 61, nameAr: 'الصف', verseCount: 14, juzStart: 28, juzEnd: 28 },
  { number: 62, nameAr: 'الجمعة', verseCount: 11, juzStart: 28, juzEnd: 28 },
  { number: 63, nameAr: 'المنافقون', verseCount: 11, juzStart: 28, juzEnd: 28 },
  { number: 64, nameAr: 'التغابن', verseCount: 18, juzStart: 28, juzEnd: 28 },
  { number: 65, nameAr: 'الطلاق', verseCount: 12, juzStart: 28, juzEnd: 28 },
  { number: 66, nameAr: 'التحريم', verseCount: 12, juzStart: 28, juzEnd: 28 },
  { number: 67, nameAr: 'الملك', verseCount: 30, juzStart: 29, juzEnd: 29 },
  { number: 68, nameAr: 'القلم', verseCount: 52, juzStart: 29, juzEnd: 29 },
  { number: 69, nameAr: 'الحاقة', verseCount: 52, juzStart: 29, juzEnd: 29 },
  { number: 70, nameAr: 'المعارج', verseCount: 44, juzStart: 29, juzEnd: 29 },
  { number: 71, nameAr: 'نوح', verseCount: 28, juzStart: 29, juzEnd: 29 },
  { number: 72, nameAr: 'الجن', verseCount: 28, juzStart: 29, juzEnd: 29 },
  { number: 73, nameAr: 'المزمل', verseCount: 20, juzStart: 29, juzEnd: 29 },
  { number: 74, nameAr: 'المدثر', verseCount: 56, juzStart: 29, juzEnd: 29 },
  { number: 75, nameAr: 'القيامة', verseCount: 40, juzStart: 29, juzEnd: 29 },
  { number: 76, nameAr: 'الإنسان', verseCount: 31, juzStart: 29, juzEnd: 29 },
  { number: 77, nameAr: 'المرسلات', verseCount: 50, juzStart: 29, juzEnd: 29 },
  { number: 78, nameAr: 'النبأ', verseCount: 40, juzStart: 30, juzEnd: 30 },
  { number: 79, nameAr: 'النازعات', verseCount: 46, juzStart: 30, juzEnd: 30 },
  { number: 80, nameAr: 'عبس', verseCount: 42, juzStart: 30, juzEnd: 30 },
  { number: 81, nameAr: 'التكوير', verseCount: 29, juzStart: 30, juzEnd: 30 },
  { number: 82, nameAr: 'الانفطار', verseCount: 19, juzStart: 30, juzEnd: 30 },
  { number: 83, nameAr: 'المطففين', verseCount: 36, juzStart: 30, juzEnd: 30 },
  { number: 84, nameAr: 'الانشقاق', verseCount: 25, juzStart: 30, juzEnd: 30 },
  { number: 85, nameAr: 'البروج', verseCount: 22, juzStart: 30, juzEnd: 30 },
  { number: 86, nameAr: 'الطارق', verseCount: 17, juzStart: 30, juzEnd: 30 },
  { number: 87, nameAr: 'الأعلى', verseCount: 19, juzStart: 30, juzEnd: 30 },
  { number: 88, nameAr: 'الغاشية', verseCount: 26, juzStart: 30, juzEnd: 30 },
  { number: 89, nameAr: 'الفجر', verseCount: 30, juzStart: 30, juzEnd: 30 },
  { number: 90, nameAr: 'البلد', verseCount: 20, juzStart: 30, juzEnd: 30 },
  { number: 91, nameAr: 'الشمس', verseCount: 15, juzStart: 30, juzEnd: 30 },
  { number: 92, nameAr: 'الليل', verseCount: 21, juzStart: 30, juzEnd: 30 },
  { number: 93, nameAr: 'الضحى', verseCount: 11, juzStart: 30, juzEnd: 30 },
  { number: 94, nameAr: 'الشرح', verseCount: 8, juzStart: 30, juzEnd: 30 },
  { number: 95, nameAr: 'التين', verseCount: 8, juzStart: 30, juzEnd: 30 },
  { number: 96, nameAr: 'العلق', verseCount: 19, juzStart: 30, juzEnd: 30 },
  { number: 97, nameAr: 'القدر', verseCount: 5, juzStart: 30, juzEnd: 30 },
  { number: 98, nameAr: 'البينة', verseCount: 8, juzStart: 30, juzEnd: 30 },
  { number: 99, nameAr: 'الزلزلة', verseCount: 8, juzStart: 30, juzEnd: 30 },
  { number: 100, nameAr: 'العاديات', verseCount: 11, juzStart: 30, juzEnd: 30 },
  { number: 101, nameAr: 'القارعة', verseCount: 11, juzStart: 30, juzEnd: 30 },
  { number: 102, nameAr: 'التكاثر', verseCount: 8, juzStart: 30, juzEnd: 30 },
  { number: 103, nameAr: 'العصر', verseCount: 3, juzStart: 30, juzEnd: 30 },
  { number: 104, nameAr: 'الهمزة', verseCount: 9, juzStart: 30, juzEnd: 30 },
  { number: 105, nameAr: 'الفيل', verseCount: 5, juzStart: 30, juzEnd: 30 },
  { number: 106, nameAr: 'قريش', verseCount: 4, juzStart: 30, juzEnd: 30 },
  { number: 107, nameAr: 'الماعون', verseCount: 7, juzStart: 30, juzEnd: 30 },
  { number: 108, nameAr: 'الكوثر', verseCount: 3, juzStart: 30, juzEnd: 30 },
  { number: 109, nameAr: 'الكافرون', verseCount: 6, juzStart: 30, juzEnd: 30 },
  { number: 110, nameAr: 'النصر', verseCount: 3, juzStart: 30, juzEnd: 30 },
  { number: 111, nameAr: 'المسد', verseCount: 5, juzStart: 30, juzEnd: 30 },
  { number: 112, nameAr: 'الإخلاص', verseCount: 4, juzStart: 30, juzEnd: 30 },
  { number: 113, nameAr: 'الفلق', verseCount: 5, juzStart: 30, juzEnd: 30 },
  { number: 114, nameAr: 'الناس', verseCount: 6, juzStart: 30, juzEnd: 30 }
];

async function main() {
  for (const surah of surahs) {
    await prisma.surah.upsert({
      where: { number: surah.number },
      update: surah,
      create: { id: surah.number, ...surah }
    });
  }
  console.log(`تمت تهيئة ${surahs.length} سورة في الجدول المرجعي.`);

  // الأدوار السبعة الأساسية (القسم 5) — تُنشأ كأدوار نظام غير قابلة للحذف لكل مؤسسة عند تهيئتها،
  // وليس هنا مباشرة لأن الأدوار مرتبطة بـ org_id. يبقى هذا الجزء TODO ضمن سكربت onboarding المؤسسة.
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
