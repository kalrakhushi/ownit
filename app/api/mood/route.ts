import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { moodEntries } from '@/drizzle/schema';
import { desc, eq } from 'drizzle-orm';

// GET - Fetch all mood entries or entries for a specific date
export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get('date');
    
    let entries;
    if (date) {
      // Get entry for specific date
      entries = await db
        .select()
        .from(moodEntries)
        .where(eq(moodEntries.date, date))
        .orderBy(desc(moodEntries.createdAt))
        .limit(1);
    } else {
      // Get all entries, most recent first
      entries = await db
        .select()
        .from(moodEntries)
        .orderBy(desc(moodEntries.date), desc(moodEntries.createdAt));
    }
    
    return NextResponse.json(entries);
  } catch (error: any) {
    console.error('Error fetching mood entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mood entries' },
      { status: 500 }
    );
  }
}

// POST - Create a new mood entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.date || body.mood === undefined) {
      return NextResponse.json(
        { error: 'Date and mood (1-10) are required' },
        { status: 400 }
      );
    }

    // Validate mood is between 1-10
    const mood = parseInt(body.mood);
    if (mood < 1 || mood > 10) {
      return NextResponse.json(
        { error: 'Mood must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Check if entry already exists for this date
    const existing = await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.date, body.date))
      .limit(1);

    let result;
    if (existing.length > 0) {
      // Update existing entry
      const [updated] = await db
        .update(moodEntries)
        .set({
          mood: mood,
          energy: body.energy ? parseInt(body.energy) : null,
          stress: body.stress ? parseInt(body.stress) : null,
          reflection: body.reflection || null,
          tags: body.tags || null,
          updatedAt: new Date(),
        })
        .where(eq(moodEntries.id, existing[0].id))
        .returning();
      
      result = updated;
    } else {
      // Create new entry
      const [created] = await db
        .insert(moodEntries)
        .values({
          date: body.date,
          mood: mood,
          energy: body.energy ? parseInt(body.energy) : null,
          stress: body.stress ? parseInt(body.stress) : null,
          reflection: body.reflection || null,
          tags: body.tags || null,
        })
        .returning();
      
      result = created;
    }
    
    return NextResponse.json(result, { status: existing.length > 0 ? 200 : 201 });
  } catch (error: any) {
    console.error('Error creating/updating mood entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save mood entry' },
      { status: 500 }
    );
  }
}
