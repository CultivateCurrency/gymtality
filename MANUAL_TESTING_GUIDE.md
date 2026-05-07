# Gymtality Manual Testing Guide

**Date:** 2026-05-07  
**Environment:** Production (https://gymtality.fit)  
**Test Duration:** ~15-20 minutes

---

## Test 1: User Signup → Welcome Email (Resend)

### Steps:

1. **Open** https://gymtality.fit/signup
2. **Fill in form:**
   - Full Name: `Test User`
   - Email: `test-YOUR-EMAIL@example.com` (use your email to receive the email)
   - Password: `TestPass123!`
   - Confirm Password: `TestPass123!`
   - Role: Select either `Member` or `Coach`
3. **Click** "Sign Up"

### Expected Results:

- ✅ Page shows success message or redirects to login
- ✅ **Welcome email arrives within 30 seconds** at the email address
- ✅ Email contains:
  - "Welcome to Gymtality"
  - Verification or onboarding link
  - Subject line from `Gymtality <noreply@gymtality.fit>`

### If Email Doesn't Arrive:

1. Check spam/junk folder
2. Check browser console for errors (`F12` → Console)
3. Check server logs:
   ```bash
   ssh -i "path-to-key" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 50" | grep -i resend
   ```
4. Verify `RESEND_API_KEY` is set in server `.env`

---

## Test 2: AI Workout Generation (OpenAI)

### Setup:

- **Prerequisites:** Must be logged in as a user (use the test account from Test 1)

### Steps:

1. **Navigate** to Member Dashboard: https://gymtality.fit/member/dashboard
2. **Find** the "Generate Workout" section (or AI Workout button)
3. **Fill in form:**
   - Goal: `Build muscle strength`
   - Fitness Level: `Intermediate`
   - Equipment: Select `Dumbbells` and `Barbell`
   - Duration: `45` minutes
   - Optional Focus: `Upper body`
4. **Click** "Generate Workout"

### Expected Results:

- ✅ Page shows loading spinner for 5-10 seconds
- ✅ **Workout plan appears with:**
  - Title (e.g., "Upper Body Strength Builder")
  - Description of the workout
  - List of exercises with:
    - Exercise name
    - Sets × Reps (e.g., "4 × 6-8")
    - Duration per exercise
    - Rest period
  - Total workout duration
- ✅ Plan is coherent and specific to inputs
- ✅ Exercises match selected equipment

### If Workout Doesn't Generate:

1. **Check browser console** (`F12` → Console) for errors
2. **Verify you're logged in** (session required)
3. **Check server logs:**
   ```bash
   ssh -i "path-to-key" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 50" | grep -i openai
   ```
4. **Verify `OPENAI_API_KEY`** is set in server `.env`
5. **Check rate limit:** Max 20 workouts per hour per user

---

## Test 3: Chat Creation (QuickBlox)

### Setup:

- **Prerequisites:** Must be logged in, preferably with 2+ test accounts

### Steps:

1. **Navigate** to Messages: https://gymtality.fit/member/messages (for members) or `/coach/messages` (for coaches)
2. **Look for** "Start New Chat" or "New Message" button
3. **Search/Select** a recipient:
   - If testing member: search for a coach account
   - If testing coach: search for a member account
4. **Click** to create dialog
5. **Type message:** "Hello, this is a test message"
6. **Click** "Send"

### Expected Results:

- ✅ Chat dialog appears or opens
- ✅ Message sends successfully within 2 seconds
- ✅ Message appears in chat window with:
  - Your message text
  - Timestamp
  - Read/delivery status
- ✅ Recipient can see the message (test with 2nd account)
- ✅ Chat appears in dialog list

### If Chat Doesn't Work:

1. **Check browser console** for WebSocket errors
2. **Verify QuickBlox session:**
   ```bash
   curl -s https://gymtality.fit/api/health/integrations | grep -A2 QuickBlox
   ```
   Should show: `"status":"success"`
3. **Check server logs:**
   ```bash
   ssh -i "path-to-key" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 50" | grep -i quickblox
   ```
4. **Verify credentials** in server `.env`:
   ```bash
   ssh -i "path-to-key" ubuntu@167.234.214.60 "grep QUICKBLOX /home/ubuntu/gymtality/.env"
   ```

---

## Test 4: Live Stream Start (AWS IVS)

### Setup:

- **Prerequisites:** Must be logged in as a Coach

### Steps:

1. **Navigate** to Streaming: https://gymtality.fit/coach/streaming
2. **Look for** "Start Live Stream" or "Go Live" button
3. **Fill in stream details:**
   - Title: `Test Workout Stream`
   - Description: `Testing AWS IVS integration`
   - Category: `Fitness` or `Strength Training`
4. **Click** "Start Stream" or "Go Live"

### Expected Results:

- ✅ Stream setup page appears within 2 seconds
- ✅ You receive:
  - **RTMPS Ingest URL** (for OBS, Streamyard, etc.)
  - **Stream Key** (secret key for streaming)
  - **Playback URL** (for viewers)
  - **Channel ARN** (AWS identifier)
- ✅ Stream status shows "LIVE" or "ACTIVE"
- ✅ You can copy credentials for OBS setup

### If Stream Doesn't Start:

1. **Check browser console** for errors
2. **Verify AWS IVS credentials:**
   ```bash
   ssh -i "path-to-key" ubuntu@167.234.214.60 "grep 'AWS_IVS' /home/ubuntu/gymtality/.env"
   ```
   Should show non-empty values for:
   - `AWS_IVS_ACCESS_KEY`
   - `AWS_IVS_SECRET_KEY`
   - `AWS_IVS_REGION` (should be `us-east-1`)
3. **Check server logs:**
   ```bash
   ssh -i "path-to-key" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 50" | grep -i ivs
   ```
4. **Verify AWS account** has IVS enabled and permissions

---

## Test 5: Rate Limiting

### Purpose:

Verify that rate limits are working to prevent abuse.

### Steps:

1. **AI Workout Rate Limit** (20/hour):
   ```bash
   for i in {1..3}; do
     curl -X POST https://gymtality.fit/api/ai/workout \
       -H "Content-Type: application/json" \
       -H "Cookie: gymtality_session=1; gymtality_at=YOUR_TOKEN" \
       -d '{"goal":"test","fitnessLevel":"beginner","equipment":["dumbbells"],"duration":30}'
     echo "Request $i"
     sleep 2
   done
   ```

2. **Login Rate Limit** (5/15min):
   ```bash
   for i in {1..6}; do
     curl -X POST https://gymtality.fit/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"test@test.com","password":"wrong"}'
     echo "Attempt $i - Status: $?"
     sleep 1
   done
   ```

### Expected Results:

- ✅ First 20 AI requests: 401/200 (allowed)
- ✅ 21st AI request: 429 Too Many Requests
- ✅ Response includes `Retry-After` header
- ✅ First 5 login attempts: 200/401 (processed)
- ✅ 6th+ attempts: 429 Too Many Requests

---

## Test 6: Health Check Endpoint

### Steps:

```bash
# From your terminal:
curl https://gymtality.fit/api/health/integrations
```

### Expected Output:

```json
{
  "timestamp": "2026-05-07T...",
  "total": 5,
  "success": 4,
  "failed": 0,
  "skipped": 0,
  "results": [
    {
      "service": "QuickBlox",
      "status": "success",
      "message": "Connected successfully. Token: ...",
      "timestamp": "..."
    },
    {
      "service": "OpenAI",
      "status": "success",
      "message": "API key is valid",
      "timestamp": "..."
    },
    ...
  ]
}
```

### Expected Results:

- ✅ HTTP 200 or 503
- ✅ All services either `success` or `skipped`
- ✅ No `failed` services
- ✅ Response time < 5 seconds

---

## Test Summary Checklist

| Test | Purpose | Status | Date |
|------|---------|--------|------|
| Signup & Email | Resend integration | ⚪ Pending | — |
| AI Workout | OpenAI integration | ⚪ Pending | — |
| Chat Creation | QuickBlox integration | ⚪ Pending | — |
| Live Stream | AWS IVS integration | ⚪ Pending | — |
| Rate Limiting | Security & DoS protection | ⚪ Pending | — |
| Health Check | Integration monitoring | ⚪ Pending | — |

---

## Success Criteria

✅ **All tests pass** = Ready for production launch  
⚠️ **Some tests fail** = Investigate and fix before launch  
❌ **Critical tests fail** = Do NOT launch until fixed

---

## Next Steps After Testing

1. **If All Tests Pass:**
   - Get Stripe production keys
   - Update `.env.production`
   - Update server `.env`
   - Redeploy
   - Test payments flow

2. **If Tests Fail:**
   - Check server logs
   - Verify env variables
   - Check API service status
   - Contact API provider support if needed

3. **Production Monitoring:**
   - Run health check every 5 minutes
   - Set up alerts for failures
   - Monitor error logs
   - Track performance metrics

---

## Troubleshooting Commands

```bash
# Check server status
ssh -i "key" ubuntu@167.234.214.60 "pm2 status"

# View app logs (last 100 lines)
ssh -i "key" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 100"

# Check environment variables
ssh -i "key" ubuntu@167.234.214.60 "cat /home/ubuntu/gymtality/.env | grep -E 'OPENAI|QUICKBLOX|AWS_IVS|RESEND'"

# Restart app
ssh -i "key" ubuntu@167.234.214.60 "pm2 restart gymtality"

# Health check
curl https://gymtality.fit/api/health/integrations
```

---

**Remember:** Test in this order: Signup → Workout → Chat → Stream → Rate Limit → Health Check

Good luck! 🚀
