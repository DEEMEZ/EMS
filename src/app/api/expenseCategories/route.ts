import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbconnect';

export async function GET(request: Request) {
  console.log('Testing database connection...');
  try {
    await dbConnect();
    console.log('Database connection successful.');
    return NextResponse.json({ message: 'Database connection is working.' });
  } catch (error: any) {
    console.error('Database connection error:', error.message, error.stack);
    return NextResponse.json(
      { error: 'Database connection failed.' },
      { status: 500 }
    );
  }
}