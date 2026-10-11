import { NextResponse } from 'next/server';

// Next.js App Router API Route for Operational Cities & Satellites
export async function GET(request: Request) {
  // In Next.js, this reads from your database (PostgreSQL / MySQL / MongoDB / Prisma)
  const operationalCities = [
    {
      id: 'city-tehran',
      name: 'تهران',
      province: 'تهران',
      isActive: true,
      isHub: true,
      satelliteCities: ['پرند', 'پردیس', 'اسلامشهر', 'شهریار', 'ورامین', 'دماوند', 'دماوند و رودهن', 'رودهن', 'بومهن', 'رباط‌کریم', 'پاکدشت', 'قرچک', 'ملارد', 'شهر قدس'],
      otherCoveredCities: ['پرند', 'پردیس', 'اسلامشهر', 'شهریار', 'ورامین', 'دماوند', 'دماوند و رودهن', 'رودهن', 'بومهن', 'رباط‌کریم', 'پاکدشت', 'قرچک', 'ملارد', 'شهر قدس'],
      districts: ['منطقه ۱', 'منطقه ۲', 'منطقه ۳', 'منطقه ۲۲']
    },
    {
      id: 'city-mashhad',
      name: 'مشهد',
      province: 'خراسان رضوی',
      isActive: true,
      isHub: true,
      satelliteCities: ['گلبهار', 'چناران', 'کلات', 'روستای لکلک', 'نیشابور', 'طرقبه', 'شاندیز'],
      otherCoveredCities: ['گلبهار', 'چناران', 'کلات', 'روستای لکلک', 'نیشابور', 'طرقبه', 'شاندیز'],
      districts: ['احمدآباد', 'سجاد', 'وکیل‌آباد', 'هاشمیه']
    }
  ];

  return NextResponse.json({ success: true, data: operationalCities });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true, message: 'City created/updated in Next.js backend', data: body });
}
