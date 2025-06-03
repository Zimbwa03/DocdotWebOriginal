
const fetch = require('node-fetch');

async function testLeaderboard() {
  try {
    // Initialize sample data
    console.log('Initializing sample data...');
    const initResponse = await fetch('http://localhost:5000/api/initialize-sample-data', {
      method: 'POST'
    });
    console.log('Sample data init:', await initResponse.json());

    // Test leaderboard
    console.log('Testing leaderboard...');
    const leaderboardResponse = await fetch('http://localhost:5000/api/leaderboard');
    const leaderboard = await leaderboardResponse.json();
    console.log('Leaderboard:', JSON.stringify(leaderboard, null, 2));

    // Test user rank
    if (leaderboard.entries && leaderboard.entries.length > 0) {
      const userId = leaderboard.entries[0].userId;
      console.log('Testing user rank for:', userId);
      const rankResponse = await fetch(`http://localhost:5000/api/user-rank?userId=${userId}`);
      const rank = await rankResponse.json();
      console.log('User rank:', rank);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testLeaderboard();
