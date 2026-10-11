import { NextResponse } from 'next/server';

// Next.js App Router API Route for Vendors Registration & Profile
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  return NextResponse.json({
    success: true,
    cityFilter: city,
    data: []
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const newVendor = {
    ...body,
    id: `vnd-${Date.now()}`,
    isVerified: false,
    verificationStatus: 'pending_verification',
    walletBalance: 1100000
  };

  return NextResponse.json({
    success: true,
    message: 'فروشگاه جدید با تعیین شهر و شهرهای اقماری تحت پوشش در Next.js ثبت شد',
    data: newVendor
  });
}
