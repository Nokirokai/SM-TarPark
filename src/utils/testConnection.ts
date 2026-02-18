import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { healthCheck } from '../services/api';

/**
 * Test the backend connection
 * Call this function in the browser console to verify backend is working:
 * 
 * import { testBackendConnection } from './utils/testConnection';
 * testBackendConnection();
 */
export async function testBackendConnection() {
  console.log('🔍 Testing SM TarPark Backend Connection...\n');
  
  console.log('📝 Configuration:');
  console.log(`  Project ID: ${projectId}`);
  console.log(`  API Base URL: https://${projectId}.supabase.co/functions/v1/make-server-66851205`);
  console.log('');

  try {
    console.log('🏥 Testing health endpoint...');
    const health = await healthCheck();
    console.log('✅ Health Check Success:', health);
    console.log('');
    
    console.log('📊 Testing public slots endpoint...');
    const slotsResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-66851205/slots`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );
    const slotsData = await slotsResponse.json();
    console.log(`✅ Slots Data: ${slotsData.slots?.length || 0} slots loaded`);
    console.log('');
    
    console.log('📈 Testing analytics endpoint...');
    const analyticsResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-66851205/analytics/dashboard`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );
    const analyticsData = await analyticsResponse.json();
    console.log('✅ Analytics Data:', analyticsData.stats);
    console.log('');
    
    console.log('🎉 All tests passed! Backend is working correctly.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Create a test account at /register');
    console.log('2. Login at /login');
    console.log('3. Start using the system!');
    
    return { success: true, message: 'Backend connection verified!' };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Check if Supabase project is running');
    console.log('2. Verify the edge function is deployed');
    console.log('3. Check browser console for detailed errors');
    
    return { success: false, error };
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  console.log('🚀 SM TarPark Backend Test Available');
  console.log('Run: testBackendConnection() in console to test connection');
  
  // Make available globally for easy testing
  (window as any).testBackendConnection = testBackendConnection;
  
  // DO NOT auto-run - only run when manually called to avoid early connection issues
}