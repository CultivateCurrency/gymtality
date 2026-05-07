# Stripe Production Keys Setup Guide

**Time Required:** 5-10 minutes  
**Difficulty:** Easy  
**Impact:** Required for real payment processing

---

## Overview

You currently have **Stripe test keys** (start with `sk_test_` and `pk_test_`). To accept real payments, you need **production keys** (start with `sk_live_` and `pk_live_`).

---

## Step 1: Access Stripe Dashboard

1. **Go to** https://dashboard.stripe.com
2. **Log in** with your Stripe account
3. **Enable production mode:**
   - Look for toggle in top-right that says "Test mode" or "Production"
   - Switch to **Production** mode

---

## Step 2: Find Your Production Keys

### Option A: Via Dashboard UI (Recommended)

1. **Click** "Developers" in the left sidebar
2. **Click** "API keys"
3. **You'll see two sections:**
   - Test keys (what you have now)
   - Live keys (what you need)
4. **Under "Live" section**, you'll see:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)
5. **Copy both values** (they're hidden by default; click the eye icon)

### Option B: Via REST API

If you need to rotate keys via API:

```bash
# Get API key info (requires your current secret key)
curl https://api.stripe.com/v1/api_keys \
  -u sk_live_YOUR_SECRET_KEY:

# This returns all your live API keys
```

---

## Step 3: Create Restricted Keys (Optional but Recommended)

For security, create restricted API keys with limited scopes:

1. **In Stripe Dashboard**, go to **Developers** → **API keys**
2. **Scroll to "Restricted API keys"** section
3. **Click** "Create restricted key"
4. **Configure permissions:**
   - ✅ `read` and `write` on Charges
   - ✅ `read` and `write` on Customers
   - ✅ `read` and `write` on Subscriptions
   - ✅ `read` on Account
   - ✅ `read` on Invoices
5. **Click** "Create key"
6. **Copy the key** (use this as your `STRIPE_SECRET_KEY`)

---

## Step 4: Update Environment Variables

### Local Development (.env)

```bash
# In forge-fitness/.env (for local testing with live keys)
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_PRODUCTION_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PRODUCTION_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PRODUCTION_KEY
```

### Production Server

```bash
# SSH into server
ssh -i "path-to-key" ubuntu@167.234.214.60

# Edit the env file
nano /home/ubuntu/gymtality/.env

# Find and replace the STRIPE lines:
# OLD (test key):
# STRIPE_SECRET_KEY=sk_test_*

# NEW (production key):
# STRIPE_SECRET_KEY=sk_live_[your_production_key_from_stripe_dashboard]

# Save and exit (Ctrl+X, then Y, then Enter)
```

### Update .env.production (for future deploys)

```bash
# From your local machine:
# Edit: forge-fitness/.env.production

# Replace these lines:
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_PRODUCTION_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PRODUCTION_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PRODUCTION_KEY
```

---

## Step 5: Restart the Application

```bash
# SSH into server
ssh -i "path-to-key" ubuntu@167.234.214.60

# Restart the app to load new keys
pm2 restart gymtality

# Verify restart
pm2 status
```

---

## Step 6: Test with Production Mode

### Test Payment Flow

1. **Navigate to** https://gymtality.fit/pricing or your payment page
2. **Select a plan** and click "Subscribe" or "Upgrade"
3. **Fill in card details:**
   - Card Number: `4242 4242 4242 4242` (Stripe test card)
   - Expiry: Any future date (e.g., `12/26`)
   - CVC: Any 3 digits (e.g., `123`)
4. **Complete payment**

### Expected Results

- ✅ Payment processes (in production, real funds move)
- ✅ Customer created in Stripe dashboard
- ✅ Subscription created (if applicable)
- ✅ Confirmation email sent (via Resend)
- ✅ User upgraded in app

### View Payment in Dashboard

1. **Go to** https://dashboard.stripe.com
2. **Ensure you're in Production mode** (toggle at top)
3. **Click** "Payments" → you should see your test transaction
4. **Click** the payment to see details:
   - Customer info
   - Amount
   - Status (should be "Succeeded")
   - Receipt email sent

---

## Step 7: Update Webhook Secret (Optional)

If you set up Stripe webhooks:

1. **In Stripe Dashboard**, go to **Developers** → **Webhooks**
2. **Select your endpoint** (should be `https://gymtality.fit/api/payments/webhook`)
3. **Scroll to "Signing secret"**
4. **Click** "Reveal" to see the secret
5. **Update on server:**
   ```bash
   ssh -i "key" ubuntu@167.234.214.60 "nano /home/ubuntu/gymtality/.env"
   
   # Update:
   STRIPE_WEBHOOK_SECRET=whsec_live_YOUR_NEW_SECRET
   
   # Restart:
   pm2 restart gymtality
   ```

---

## Security Best Practices

✅ **DO:**
- Store keys in `.env` files (not in code)
- Use restricted keys when possible
- Rotate keys every 90 days
- Store secret keys securely (never in client code)
- Use environment variables for sensitive data

❌ **DON'T:**
- Commit keys to GitHub (use `.gitignore`)
- Share keys in Slack, email, or public forums
- Use the same keys across environments (test vs. production)
- Log secret keys (check logs for accidental exposure)
- Use publishable key as secret key

---

## Testing Cards (Production Mode)

Even in production mode, you can test with these card numbers:

| Card Type | Number | Status |
|-----------|--------|--------|
| Visa | `4242 4242 4242 4242` | Succeeds |
| Visa | `4000 0025 0000 3155` | Requires 3D Secure |
| Visa | `4000 0000 0000 0002` | Declines |
| Mastercard | `5555 5555 5555 4444` | Succeeds |
| Amex | `3782 822463 10005` | Succeeds |

**Important:** These test cards will NOT charge real money in production. Stripe provides them specifically for testing.

---

## Troubleshooting

### Payment Processing Fails

1. **Check that you're using production keys:**
   ```bash
   ssh -i "key" ubuntu@167.234.214.60 "grep STRIPE_SECRET_KEY /home/ubuntu/gymtality/.env"
   ```
   Should show: `sk_live_*` (not `sk_test_*`)

2. **Verify webhook endpoint:**
   - https://dashboard.stripe.com → Developers → Webhooks
   - Endpoint should be: `https://gymtality.fit/api/payments/webhook`

3. **Check server logs:**
   ```bash
   ssh -i "key" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 100" | grep -i stripe
   ```

4. **Test webhook delivery:**
   - In Stripe Dashboard → Webhooks
   - Click your endpoint
   - Scroll to "Events"
   - You should see recent events (payment_intent.succeeded, etc.)

### Card Decline

- Use test card `4242 4242 4242 4242` (always succeeds in test)
- Check Stripe Dashboard for decline reason
- Verify your account is in good standing

### Keys Don't Load After Update

1. Verify keys are in `.env`: `cat /home/ubuntu/gymtality/.env | grep STRIPE`
2. App must be restarted: `pm2 restart gymtality`
3. Check logs for errors: `pm2 logs gymtality --lines 50`

---

## Verification Checklist

- [ ] Logged into Stripe Dashboard
- [ ] Switched to Production mode
- [ ] Copied live secret key (`sk_live_*`)
- [ ] Copied live publishable key (`pk_live_*`)
- [ ] Updated local `.env` file
- [ ] Updated server `/home/ubuntu/gymtality/.env`
- [ ] Updated `.env.production` for future deploys
- [ ] Restarted app: `pm2 restart gymtality`
- [ ] Tested payment with test card `4242 4242 4242 4242`
- [ ] Verified payment appears in Stripe Dashboard
- [ ] Confirmed customer/subscription created
- [ ] Checked webhook events in Dashboard

---

## Next Steps

1. ✅ Complete steps 1-5 above
2. ✅ Test payment flow (Step 6)
3. ✅ Monitor transactions in Stripe Dashboard
4. ✅ Set up Stripe alerts for disputes/chargebacks
5. ✅ Configure tax rates (if applicable)
6. ✅ Set up invoice templates (if applicable)

---

## Support

- **Stripe Docs:** https://stripe.com/docs
- **Stripe API Reference:** https://stripe.com/docs/api
- **Stripe Support:** https://support.stripe.com

---

**Status:** Ready for production payment processing after completing this guide ✅
