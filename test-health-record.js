// Quick test script to verify health records API
// Run with: node test-health-record.js

const testHealthRecord = async () => {
  const testData = {
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    weight: 70.5,
    steps: 10000,
    sleep: 7.5,
    calories: 2000,
    protein: 150
  };

  try {
    console.log('Testing health records API...');
    console.log('Sending data:', testData);
    
    const response = await fetch('http://localhost:3000/api/health-records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success! Record created:', result);
    } else {
      console.error('❌ Error:', result);
      console.error('Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

testHealthRecord();
