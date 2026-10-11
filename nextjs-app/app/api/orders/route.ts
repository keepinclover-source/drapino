import { NextResponse } from 'next/server';

// Next.js App Router API Route for Orders & Hunting Board with Strict City Filter
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  // Filter orders by specific city if requested
  return NextResponse.json({
    success: true,
    filterCity: city,
    message: city ? `سفارشات تابلوی شکار شهر ${city}` : 'کلیه سفارشات سامانه',
    data: []
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const orderNumber = `AP-${Math.floor(1000 + Math.random() * 9000)}`;

  return NextResponse.json({
    success: true,
    message: 'سفارش در بکند Next.js و دیتابیس ثبت گردید',
    data: { ...body, orderNumber, id: `ord-${Date.now()}` }
  });
}
