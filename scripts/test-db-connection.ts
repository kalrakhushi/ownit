import { prisma } from '../lib/prisma'

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...')
    
    // Test 1: Simple query to verify connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful!')
    console.log('   Query result:', result)
    
    // Test 2: Check database info
    const dbInfo = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `
    console.log('✅ Database tables:', dbInfo.map(t => t.name).join(', ') || 'No tables found')
    
    // Test 3: Test User model (if it exists)
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ User model accessible. Current user count: ${userCount}`)
    } catch (error: any) {
      console.log(`⚠️  User model test skipped: ${error.message}`)
    }
    
    console.log('\n🎉 All database tests passed!')
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

testConnection()
