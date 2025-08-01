// Simple API test script
const testAPI = async () => {
    try {
        console.log('Testing API endpoints...');
        
        // Test health endpoint
        const healthResponse = await fetch('https://canvas-crafters.vercel.app/api/health');
        console.log('Health check status:', healthResponse.status);
        
        // Test if auth endpoint exists (should return method not allowed for GET)
        const authResponse = await fetch('https://canvas-crafters.vercel.app/api/auth/login');
        console.log('Auth endpoint status:', authResponse.status);
        
    } catch (error) {
        console.error('API test failed:', error);
    }
};

testAPI();
