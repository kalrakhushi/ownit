// Quick test script to check API endpoint
const testData = {
  date: new Date().toISOString().split('T')[0],
  weight: 70,
  steps: 5000
};

fetch('http://localhost:3000/api/health-records', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
  .then(async (response) => {
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Not JSON');
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
