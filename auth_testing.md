Auth-Gated App Testing Playbook

NOTE: Do not be satisfied until you've tested the app completely especially the auth gated pages.

## Step 1: Create Test User & Session
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"

## Step 2: Test Backend API
# Test auth endpoint
curl -X GET "$URL/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Test protected endpoints
curl -X GET "$URL/api/reports?user_id=user_xxx" -H "Authorization: Bearer YOUR_SESSION_TOKEN"

## Step 3: Browser Testing
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "your-app.com",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}])

## Checklist
- User document has user_id field (custom UUID)
- Session user_id matches user's user_id exactly
- All queries use {"_id": 0} projection
- /api/auth/me returns user data
- Dashboard loads without redirect

## Failure Indicators
- "User not found" errors
- 401 Unauthorized responses
- Redirect to login page
