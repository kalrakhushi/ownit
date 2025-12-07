import { NextRequest, NextResponse } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { wearableSamples } from '@/drizzle/schema'

const allowedSources = new Set(['apple_health', 'fitbit', 'google_fit', 'myfitnesspal'])
const allowedTypes = new Set([
  'steps',
  'calories',
  'sleep',
  'heart_rate',
  'distance',
  'nutrition',
])

const parseIso = (value: unknown) => {
  if (typeof value !== 'string') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const parseNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

type WearableSampleInput = {
  source: string
  type: string
  startTime: string
  endTime?: string
  value: number | string
  unit?: string
  metadata?: Record<string, unknown>
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const source = url.searchParams.get('source')?.toLowerCase()
    const type = url.searchParams.get('type')?.toLowerCase()
    const limitParam = url.searchParams.get('limit')
    const limit = Math.min(Math.max(Number(limitParam) || 100, 1), 500)

    const filters = []
    if (source) filters.push(eq(wearableSamples.source, source))
    if (type) filters.push(eq(wearableSamples.type, type))

    const query = db
      .select()
      .from(wearableSamples)
      .orderBy(desc(wearableSamples.startTime))
      .limit(limit)

    const records = filters.length ? await query.where(and(...filters)) : await query

    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching wearable samples:', error)
    return NextResponse.json({ error: 'Failed to fetch wearable data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const samples: WearableSampleInput[] = Array.isArray(body) ? body : [body]

    if (!samples.length) {
      return NextResponse.json({ error: 'No samples provided' }, { status: 400 })
    }

    const normalized = samples.map((sample, index) => {
      const source = sample.source?.toLowerCase()
      const type = sample.type?.toLowerCase()
      const startTime = parseIso(sample.startTime)
      const endTime = parseIso(sample.endTime ?? sample.startTime)
      const value = parseNumber(sample.value)
      const unit = sample.unit || null

      if (!source || !allowedSources.has(source)) {
        throw new Error(`Sample ${index}: invalid source`)
      }
      if (!type || !allowedTypes.has(type)) {
        throw new Error(`Sample ${index}: invalid type`)
      }
      if (!startTime || !endTime) {
        throw new Error(`Sample ${index}: invalid startTime/endTime`)
      }
      if (value === null) {
        throw new Error(`Sample ${index}: invalid value`)
      }

      let metadata: string | null = null
      if (sample.metadata) {
        try {
          metadata = JSON.stringify(sample.metadata)
        } catch {
          throw new Error(`Sample ${index}: metadata must be serializable`)
        }
      }

      return {
        source,
        type,
        startTime,
        endTime,
        value,
        unit,
        metadata,
      }
    })

    const inserted = await db
      .insert(wearableSamples)
      .values(normalized)
      .onConflictDoNothing({
        target: [
          wearableSamples.source,
          wearableSamples.type,
          wearableSamples.startTime,
          wearableSamples.endTime,
        ],
      })
      .returning()

    return NextResponse.json(
      {
        inserted: inserted.length,
        skipped: normalized.length - inserted.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error ingesting wearable samples:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to ingest wearable data' },
      { status: 400 },
    )
  }
}
