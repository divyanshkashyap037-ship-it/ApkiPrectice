// Run this script in browser console to clear all stored data
// Or run via npm script

if (typeof window !== 'undefined' && window.localStorage) {
  localStorage.removeItem('interview_questions_v1');
  console.log('✅ localStorage cleared! All data reset to fresh state.');
  console.log('🔄 Refresh the page to see the changes.');
} else {
  console.log('⚠️ This script must be run in a browser environment.');
  console.log('📝 Open your app in the browser, open DevTools Console, and paste this code:');
  console.log('   localStorage.removeItem("interview_questions_v1"); location.reload();');
}
