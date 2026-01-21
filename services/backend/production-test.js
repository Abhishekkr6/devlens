// ========================================
// TeamPulse AI - Production Test (FIXED)
// ========================================
// Copy-paste this in browser console (F12)

const CONFIG = {
    API: 'https://teampulse-w2s8.onrender.com',

    // Get JWT token from cookies:
    // DevTools → Application → Cookies → teampulse_token
    TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NWYzYTkyMjMxM2JmZWI1ZDQ4ZWYyMyIsImlhdCI6MTc2ODk3MzU3NSwiZXhwIjoxNzY5NTc4Mzc1fQ.LHq190bLzW2U5F4Dy4vjLG6k-gnpLIONt6onNrykoqY',

    ORG_ID: '6967657fdb5155429fc77f8e',
    REPO_ID: '696e20645108b9d2ce1898b6',
    PR_ID: '696e23e9a07a83219ea3d6cb'
};

console.log('🧪 TeamPulse AI - Production Test\n');
console.log('='.repeat(50));

// Test 1: Check if AI is available
console.log('\n📍 Test 1: Checking AI Status...');
fetch(`${CONFIG.API}/api/v1/ai/status`)
    .then(response => response.json())
    .then(data => {
        const available = data.data?.aiAvailable;
        console.log(available ? '✅ PASS - AI is available' : '❌ FAIL - AI not available');
        console.log('   Provider:', data.data?.provider || 'none');
        console.log('   Features:', data.data?.features);

        if (!available) {
            console.log('\n⚠️  Fix: Add GEMINI_API_KEY to Render environment variables');
            throw new Error('AI not available');
        }

        // Test 2: Analyze PR (FIXED - using Authorization header)
        console.log('\n📍 Test 2: Analyzing PR...');
        console.log('   This may take 5-10 seconds...');

        return fetch(`${CONFIG.API}/api/v1/ai/analyze-pr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.TOKEN}` // ✅ FIXED: Use Authorization header
            },
            body: JSON.stringify({
                orgId: CONFIG.ORG_ID,
                repoId: CONFIG.REPO_ID,
                prId: CONFIG.PR_ID
            })
        });
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ PASS - Analysis completed');
            console.log('\n📊 Results:');
            console.log('   Overall Score:', data.data.overallScore + '/100');
            console.log('   AI Review Score:', data.data.aiReview?.score + '/100');
            console.log('   Issues Found:', data.data.aiReview?.issues?.length || 0);
            console.log('   Quality Grade:', data.data.qualityMetrics?.grade);
            console.log('   Bug Probability:', data.data.bugProbability?.probability + '%');
            console.log('   Processing Time:', data.data.processingTimeMs + 'ms');

            console.log('\n🎉 All tests PASSED! AI features are working correctly.');
            console.log('\n📝 Recommendations:');
            data.data.recommendations?.forEach((rec, i) => {
                console.log(`   ${i + 1}. ${rec}`);
            });

            console.log('\n📝 Full Response:');
            console.log(data.data);
        } else {
            console.log('❌ FAIL - Analysis failed');
            console.log('   Error:', data.error?.message);

            if (data.error?.message?.includes('not found')) {
                console.log('\n⚠️  Fix: Check that orgId, repoId, and prId are correct');
            } else if (data.error?.message?.includes('Unauthorized') || data.error?.message?.includes('token')) {
                console.log('\n⚠️  Fix: Token expired or invalid. Get fresh token from cookies');
            }
        }
    })
    .catch(error => {
        console.log('❌ Test failed with error:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check that backend URL is correct');
        console.log('   2. Make sure TOKEN is fresh (not expired)');
        console.log('   3. Verify orgId, repoId, prId are valid');
        console.log('   4. Check GEMINI_API_KEY is set in Render');
    });

console.log('\n' + '='.repeat(50));
console.log('⏳ Running tests... Please wait...\n');
