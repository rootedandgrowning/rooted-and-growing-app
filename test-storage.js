// Quick test to understand localStorage state
console.log("=== Testing Storage ===");

// Check if running in web
console.log("Platform:", typeof window !== 'undefined' ? 'web' : 'native');

// Check localStorage
if (typeof localStorage !== 'undefined') {
  console.log("localStorage available");
  
  // List all keys
  const keys = Object.keys(localStorage);
  console.log("Total keys:", keys.length);
  
  // Check for our keys
  const rootedKeys = keys.filter(k => k.startsWith('@rooted'));
  console.log("Rooted keys:", rootedKeys);
  
  // Check user preferences
  const prefs = localStorage.getItem('@rooted_user_preferences');
  if (prefs) {
    console.log("User preferences found:", JSON.parse(prefs));
  } else {
    console.log("No user preferences found");
  }
} else {
  console.log("localStorage NOT available");
}
