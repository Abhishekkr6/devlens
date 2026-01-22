// Test individual Gemini API keys
const { GoogleGenerativeAI } = require('@google/generative-ai');

const keys = [
    'AIzaSyAc3RcUCcoSt4cUzaHmmMZ6rNnmk0Adc_8',
    'AIzaSyD3QvedfkqMr9nMbckkeZhyNz3oKC136VM',
    'AIzaSyAKsY9cpqQpsllMjF9FhetMXy1iCPaBkcY',
    'AIzaSyAPGBGGCmT_sLYwmAFei1CKZEb_95YUfaw',
    'AIzaSyA_MIXp_KB2l1eOw4KZ1eaF3kju671LbLE'
];

async function testKey(apiKey, index) {
    try {
        console.log(`\n🔑 Testing Key ${index + 1}...`);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const result = await model.generateContent('Say "Hello" in one word');
        const response = await result.response;
        const text = response.text();

        console.log(`✅ Key ${index + 1}: WORKING - Response: ${text.trim()}`);
        return true;
    } catch (error) {
        console.log(`❌ Key ${index + 1}: FAILED - ${error.message}`);
        if (error.message.includes('quota')) {
            console.log(`   ⚠️  Quota exceeded on this key`);
        } else if (error.message.includes('API_KEY_INVALID')) {
            console.log(`   ⚠️  Invalid API key`);
        }
        return false;
    }
}

async function testAllKeys() {
    console.log('🧪 Testing All Gemini API Keys');
    console.log('='.repeat(50));

    let workingKeys = 0;
    let quotaExceeded = 0;
    let invalidKeys = 0;

    for (let i = 0; i < keys.length; i++) {
        const success = await testKey(keys[i], i);
        if (success) {
            workingKeys++;
        } else {
            // Check error type
            quotaExceeded++;
        }

        // Wait 1 second between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   Total Keys: ${keys.length}`);
    console.log(`   ✅ Working: ${workingKeys}`);
    console.log(`   ❌ Failed: ${keys.length - workingKeys}`);
    console.log(`   ⚠️  Quota Issues: ${quotaExceeded}`);
    console.log('='.repeat(50));

    if (workingKeys === 0) {
        console.log('\n🚨 PROBLEM: All keys are failing!');
        console.log('\n💡 Possible solutions:');
        console.log('   1. Keys might be invalid - verify on AI Studio');
        console.log('   2. Quota reset time might be different');
        console.log('   3. Need to create new API keys');
    } else if (workingKeys < keys.length) {
        console.log(`\n⚠️  WARNING: Only ${workingKeys}/${keys.length} keys working`);
        console.log('   Consider replacing failed keys');
    } else {
        console.log('\n🎉 SUCCESS: All keys are working!');
        console.log('   Multi-key rotation should work perfectly');
    }
}

testAllKeys().catch(console.error);
