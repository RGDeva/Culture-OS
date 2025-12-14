import { prisma } from '../lib/prisma';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test connection by querying the User table
    const users = await prisma.user.findMany({
      take: 5
    });
    
    console.log('Database connection successful!');
    console.log(`Found ${users.length} users in the database.`);
    
    if (users.length > 0) {
      console.log('Sample user:', {
        id: users[0].id,
        email: users[0].email,
        displayName: users[0].displayName,
        onboarded: users[0].onboarded
      });
    }
    
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
