// Simple test script for CCTP API
const BASE_URL = 'http://localhost:3000';

async function testCCTP() {
  console.log('🧪 Testing CCTP API...\n');

  // Test 1: Approve
  console.log('1️⃣ Testing approve...');
  try {
    const approveResponse = await fetch(`${BASE_URL}/api/circle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approve',
        sourceChain: 'sepolia',
        amount: '1',
        walletAddress: '0x1234567890123456789012345678901234567890'
      })
    });
    
    const approveData = await approveResponse.json();
    console.log('✅ Approve response:', approveData);
  } catch (error) {
    console.log('❌ Approve failed:', error.message);
  }

  // Test 2: Deposit for burn
  console.log('\n2️⃣ Testing depositForBurn...');
  try {
    const burnResponse = await fetch(`${BASE_URL}/api/circle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'depositForBurn',
        sourceChain: 'sepolia',
        destinationChain: 'arbitrumSepolia',
        amount: '2',
        recipientAddress: '0x1234567890123456789012345678901234567890',
        walletAddress: '0x1234567890123456789012345678901234567890'
      })
    });
    
    const burnData = await burnResponse.json();
    console.log('✅ Burn response:', burnData);
  } catch (error) {
    console.log('❌ Burn failed:', error.message);
  }

  // Test 3: Get attestation (with fake hash)
  console.log('\n3️⃣ Testing getAttestation...');
  try {
    const attestationResponse = await fetch(`${BASE_URL}/api/circle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getAttestation',
        messageHash: '0x1234567890123456789012345678901234567890123456789012345678901234'
      })
    });
    
    const attestationData = await attestationResponse.json();
    console.log('✅ Attestation response:', attestationData);
  } catch (error) {
    console.log('❌ Attestation failed:', error.message);
  }

  // Test 4: Receive message
  console.log('\n4️⃣ Testing receiveMessage...');
  try {
    const receiveResponse = await fetch(`${BASE_URL}/api/circle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'receiveMessage',
        destinationChain: 'arbitrumSepolia',
        messageBytes: '0x1234567890',
        attestation: '0xabcdef123456',
        walletAddress: '0x1234567890123456789012345678901234567890'
      })
    });
    
    const receiveData = await receiveResponse.json();
    console.log('✅ Receive message response:', receiveData);
  } catch (error) {
    console.log('❌ Receive message failed:', error.message);
  }

  console.log('\n🎉 CCTP API test completed!');
}

// Run the test
testCCTP().catch(console.error); 