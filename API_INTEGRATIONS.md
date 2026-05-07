# Gymtality API Integrations Verification Guide

**Last Updated:** 2026-05-07

This document lists all external API integrations, their status, and how to verify they're working correctly.

---

## Integration Status Summary

| API | Status | Purpose | Verified |
|-----|--------|---------|----------|
| **OpenAI** | ✅ Active | GPT-4o-mini for AI features (workouts, coaching, mindset, music) | [Test →](#test-openai) |
| **Stripe** | ✅ Active | Payment processing & subscriptions | [Test →](#test-stripe) |
| **QuickBlox** | ✅ Active | Chat & video calls | [Test →](#test-quickblox) |
| **AWS IVS** | ✅ Configured | Live streaming (coach broadcasts) | [Test →](#test-aws-ivs) |
| **Resend** | ✅ Active | Email notifications (welcome, password reset) | [Test →](#test-resend) |
| **Google Fit** | ✅ Configured | Wearable data sync (Apple Watch, Fitbit, Google Fit) | Manual only |
| **Oracle Cloud Storage** | ✅ Configured | File uploads (workout videos, photos) | Manual only |
| **NextAuth.js** | ✅ Active | Authentication & OAuth | Built-in |

---

## Automated Integration Tests

### Quick Test All APIs

```bash
# From the project root:
curl http://localhost:3000/api/health/integrations

# Expected response (200 OK if all pass):
{
  "timestamp": "2026-05-07T...",
  "total": 5,
  "success": 5,
  "failed": 0,
  "skipped": 0,
  "results": [...]
}
```

---

## Individual Integration Tests

### Test OpenAI

**Endpoint:** `GET /api/health/integrations`

**What it does:**
- Validates `OPENAI_API_KEY` by calling OpenAI API
- Checks if key is valid and not expired

**Manual test:**
```bash
curl -X POST http://localhost:3000/api/ai/workout \
  -H "Content-Type: application/json" \
  -b "gymtality_session=1" \
  -b "gymtality_at=<your-token>" \
  -d '{
    "goal": "build muscle",
    "fitnessLevel": "intermediate",
    "equipment": ["dumbbells"],
    "duration": 30
  }'
```

**Expected:**
- ✅ Returns workout plan with exercises, sets, reps
- ❌ Error: "Invalid OpenAI API key"
- ❌ Error: "Rate limited (429)"

---

### Test Stripe

**Endpoint:** `GET /api/health/integrations`

**What it does:**
- Validates `STRIPE_SECRET_KEY` by connecting to Stripe API
- Checks if key is valid and account is active

**Manual test:**
```bash
# List plans
curl -X GET http://localhost:3000/api/payments/plans \
  -H "Authorization: Bearer <your-token>"

# Expected: List of subscription plans
```

**Expected:**
- ✅ Can fetch account details
- ✅ Can list payment methods
- ❌ Error: "Invalid API key"

---

### Test QuickBlox

**Endpoint:** `GET /api/health/integrations`

**What it does:**
- Validates QuickBlox credentials (`APP_ID`, `AUTH_KEY`, `AUTH_SECRET`)
- Attempts to create an app session
- Verifies JWT signature generation

**Manual test:**
```bash
# In browser console, on the chat page:
const token = await fetch('/api/chat/session').then(r => r.json());
console.log(token); // Should contain token, userId

# Or curl (if you have a user token):
curl -X GET http://localhost:3000/api/chat/dialogs \
  -H "Authorization: Bearer <your-token>"
```

**Expected:**
- ✅ Session token returned successfully
- ✅ Can list dialogs
- ❌ Error: "Invalid credentials"
- ❌ Error: "Signature verification failed"

---

### Test AWS IVS

**Endpoint:** `GET /api/health/integrations`

**What it does:**
- Checks if `AWS_IVS_ACCESS_KEY` and `AWS_IVS_SECRET_KEY` are configured
- Does NOT require a channel to exist (just validates credentials format)

**Manual test:**
```bash
# Start a live stream (in coach dashboard):
POST /api/streaming/start
{
  "title": "Test Stream"
}

# Expected response:
{
  "success": true,
  "data": {
    "channelArn": "arn:aws:ivs:...",
    "playbackUrl": "https://...",
    "ingestEndpoint": "rtmps://...",
    "streamKey": "..."
  }
}
```

**Expected:**
- ✅ Credentials configured and AWS accepts them
- ❌ Error: "Invalid AWS credentials"
- ❌ Error: "Channel creation failed"

---

### Test Resend

**Endpoint:** `GET /api/health/integrations`

**What it does:**
- Validates `RESEND_API_KEY` by calling Resend API
- Checks if key is valid and not expired

**Manual test:**
```bash
# Trigger an email (e.g., sign up):
POST /api/auth/signup
{
  "email": "test@example.com",
  "password": "...",
  "fullName": "Test User"
}

# Check your email for confirmation message
```

**Expected:**
- ✅ Welcome email received
- ⚠️ Email may go to spam folder
- ❌ Error: "Invalid Resend API key"

---

## Configuration Status

### ✅ Fully Configured

- **OpenAI** — API key set, uses GPT-4o-mini
- **Stripe** — Test mode (upgrade to production keys before launch)
- **QuickBlox** — Test app ID configured, credentials valid
- **AWS IVS** — Access key & secret configured
- **Resend** — API key configured, test mode
- **Google OAuth** — Test app configured
- **OCI Storage** — Test bucket configured

### ⚠️ Requires Setup

- **Redis** — Optional but recommended for production
  - Set `REDIS_URL` in `.env.production` for horizontal scaling
  - Without it: uses in-memory rate limiting (single instance only)

- **Google Fit** — Configured but requires user OAuth authorization
  - Users must connect their wearable accounts in app settings

- **Production Stripe Keys** — Currently using test keys
  - Replace `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` before going live

---

## Troubleshooting

### "API key is invalid"

**For OpenAI:**
- Check `OPENAI_API_KEY` in `.env` or `.env.production`
- Ensure key starts with `sk-proj-`
- Verify key hasn't been revoked in OpenAI dashboard

**For Stripe:**
- Check `STRIPE_SECRET_KEY` in `.env`
- Ensure key starts with `sk_test_` or `sk_live_`
- Test keys won't work with production logic

**For Resend:**
- Check `RESEND_API_KEY` in `.env`
- Ensure key starts with `re_`

### "Credentials not configured"

- Check that all required env vars are set
- Look for `missing XXXX_API_KEY` error message
- Verify `.env.production` has all keys before deploying

### "Connection timeout"

- Check internet connectivity
- Verify firewall isn't blocking external connections
- Check API service status (uptime pages for each provider)

### Redis Not Connecting

- If `REDIS_URL` is set but connection fails:
  - Check Redis server is running and accessible
  - Verify connection string format: `redis://user:pass@host:port`
  - Falls back to in-memory automatically (logs error to console)

---

## Health Check Endpoint

The health check provides real-time status of all integrations:

```bash
curl http://localhost:3000/api/health/integrations
```

**Response codes:**
- **200 OK** — All integrations working or skipped (no failures)
- **503 Service Unavailable** — One or more integrations failed

**Response format:**
```json
{
  "timestamp": "2026-05-07T12:34:56.789Z",
  "total": 5,
  "success": 5,
  "failed": 0,
  "skipped": 0,
  "results": [
    {
      "service": "OpenAI",
      "status": "success",
      "message": "API key is valid",
      "timestamp": "2026-05-07T12:34:56.789Z"
    },
    {
      "service": "Stripe",
      "status": "success",
      "message": "API key is valid",
      "timestamp": "2026-05-07T12:34:56.789Z"
    }
  ]
}
```

---

## Monitoring in Production

### Pre-Deployment Checklist

- [ ] Run `GET /api/health/integrations` and verify all tests pass
- [ ] Replace Stripe test keys with production keys (if launching paid features)
- [ ] Set `NEXTAUTH_SECRET` to a secure random value
- [ ] Generate and set `JWT_SECRET` for token verification
- [ ] Set `INTERNAL_WEBHOOK_SECRET` for webhook security
- [ ] Configure `REDIS_URL` if running multiple server instances
- [ ] Test email sending (sign up and check inbox)
- [ ] Test OAuth flows (Google, QuickBlox)
- [ ] Test AWS IVS streaming (create a channel and start broadcast)

### Post-Deployment Monitoring

- Monitor API error logs for integration failures
- Set up alerts for:
  - OpenAI rate limit errors (429)
  - Stripe webhook failures
  - QuickBlox session errors
  - AWS IVS stream failures
  - Resend email delivery failures
- Run health check periodically (recommend every 5 minutes)
- Keep API keys rotated quarterly

---

## API Rate Limits

| Service | Limit | Window |
|---------|-------|--------|
| **OpenAI** | 3,500 requests | Per minute |
| **Stripe** | 100 requests | Per second |
| **QuickBlox** | 500 requests | Per minute |
| **Resend** | 5,000 emails | Per day |
| **AWS IVS** | 500 API calls | Per second |

**App Rate Limits** (frontend):
- Login: 5 attempts per 15 minutes
- 2FA: 5 attempts per 15 minutes
- AI Workout: 20 per hour per user
- AI Mindset: 20 per hour per user
- AI Coach: 30 per hour per user
- AI Music: 30 per hour per user

---

## Support & Documentation

- **OpenAI**: https://platform.openai.com/docs/api-reference
- **Stripe**: https://stripe.com/docs/api
- **QuickBlox**: https://docs.quickblox.com/reference
- **AWS IVS**: https://docs.aws.amazon.com/ivs/
- **Resend**: https://resend.com/docs
- **Google Fit**: https://developers.google.com/fit/rest/v1
- **Oracle Cloud Storage**: https://docs.oracle.com/en-us/iaas/Content/Object/home.htm

---

**Last Verified:** 2026-05-07
**Next Verification:** 2026-05-14
