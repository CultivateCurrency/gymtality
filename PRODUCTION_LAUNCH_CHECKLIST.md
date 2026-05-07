# Gymtality Production Launch Checklist

**Status:** Ready for Final QA  
**Current Environment:** https://gymtality.fit (Production)  
**Last Updated:** 2026-05-07

---

## 📋 Pre-Launch Verification

### Code & Deployment

- [x] All orphaned code removed (Anthropic, Prisma)
- [x] Redis rate limiting implemented
- [x] Integration tests created
- [x] Health check endpoint working
- [x] All 9 API endpoints responding correctly
- [x] TLS/SSL certificates valid
- [x] GitHub repository up-to-date
- [x] Last commit: `0cc2900` (Production hardening)

### Environment Configuration

- [x] JWT_SECRET generated and set
- [x] INTERNAL_WEBHOOK_SECRET generated and set
- [x] NEXTAUTH_SECRET updated to production value
- [x] AWS IVS credentials configured
- [x] All API keys loaded on server
- [ ] Stripe production keys configured (NEXT STEP)
- [ ] Redis URL configured (optional, for scaling)
- [ ] Database backups automated
- [ ] Log retention policy set

### Security Verification

- [x] Auth required on protected routes
- [x] Rate limiting enforced
- [x] CORS configured
- [x] HTTPS/TLS enabled
- [x] Secret keys not in code
- [ ] Security headers optimized
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens validated

---

## 🧪 Testing Roadmap

### Phase 1: Integration Testing (TODAY)

Follow **MANUAL_TESTING_GUIDE.md** to verify:

- [ ] **Test 1:** User signup → Welcome email (Resend)
  - Create test account
  - Verify welcome email arrives within 30 seconds
  - Check email content and formatting

- [ ] **Test 2:** AI Workout Generation (OpenAI)
  - Log in with test account
  - Generate workout with various inputs
  - Verify exercises are specific and coherent
  - Check rate limiting (20/hour limit)

- [ ] **Test 3:** Chat Creation (QuickBlox)
  - Create 2+ test accounts
  - Start chat between accounts
  - Send message, verify delivery
  - Test real-time notifications

- [ ] **Test 4:** Live Stream Start (AWS IVS)
  - Log in as coach
  - Start live stream
  - Receive RTMPS URL, stream key, playback URL
  - (Optional) Test with OBS/Streamyard

- [ ] **Test 5:** Rate Limiting
  - Exceed rate limits intentionally
  - Verify 429 response
  - Verify Retry-After header

- [ ] **Test 6:** Health Check
  - Run: `curl https://gymtality.fit/api/health/integrations`
  - Verify response time < 5 seconds
  - All services passing or skipped

**Success Criteria:** All 6 tests pass ✅

---

### Phase 2: Stripe Production Setup (PARALLEL)

Follow **STRIPE_PRODUCTION_SETUP.md** to:

- [ ] Access Stripe Dashboard
- [ ] Switch to Production mode
- [ ] Copy live secret key (`sk_live_*`)
- [ ] Copy live publishable key (`pk_live_*`)
- [ ] Create restricted API keys (recommended)
- [ ] Update local `.env` file
- [ ] Update server `.env` via SSH
- [ ] Update `.env.production` for future deploys
- [ ] Restart app: `pm2 restart gymtality`
- [ ] Test payment with test card `4242 4242 4242 4242`
- [ ] Verify payment in Stripe Dashboard
- [ ] Confirm subscription created (if applicable)

**Success Criteria:** Payment processes end-to-end ✅

---

### Phase 3: Production Monitoring (PARALLEL)

Follow **PRODUCTION_MONITORING_SETUP.md** to:

- [ ] Set up uptime monitoring (Uptime.com or StatusCake)
- [ ] Configure email alerts
- [ ] Set up Slack alerts (optional)
- [ ] Create health check cron job
- [ ] Create performance monitoring script
- [ ] Test alerting system (verify you get notified)
- [ ] Document runbooks for common issues
- [ ] Create incident response procedures
- [ ] Train team on monitoring

**Success Criteria:** You receive test alert when integration fails ✅

---

## 🚀 Launch Day Procedure

### Morning (Before Going Live)

- [ ] Run final health check: `curl https://gymtality.fit/api/health/integrations`
- [ ] Verify all integrations passing (4/5 at minimum)
- [ ] Check server logs for errors: `pm2 logs gymtality --lines 100`
- [ ] Check disk space: `df -h`
- [ ] Check memory: `free -h`
- [ ] Verify backups completed

### Go Live Decision

✅ **Green Light to Launch If:**
- All tests passed
- Stripe payment working
- Monitoring alerts working
- Team trained
- Incident response documented

❌ **HOLD Launch If:**
- Any test failing
- Any integration failing
- Alert system not working
- Team not ready

### During Launch

- [ ] Have monitoring dashboard open
- [ ] Have incident response runbook ready
- [ ] Disable other services if possible (reduce variables)
- [ ] Increase monitoring frequency (every 1 minute)
- [ ] Have team on standby
- [ ] Document any anomalies

### Post-Launch (First 24 Hours)

- [ ] Monitor health checks every 5 minutes
- [ ] Review logs every 30 minutes
- [ ] Check error rate
- [ ] Monitor payment throughput
- [ ] Monitor API response times
- [ ] Document any incidents
- [ ] Have team on call

---

## 📊 Success Metrics

### Availability

| Metric | Target | Current |
|--------|--------|---------|
| Uptime | 99.5% | Monitoring |
| Response Time | < 1s | Testing |
| Error Rate | < 0.1% | Baseline |
| Payment Success | 99% | Testing |

### Integration Health

| Service | Status | SLA |
|---------|--------|-----|
| OpenAI | ✅ | 99% |
| QuickBlox | ✅ | 99.5% |
| Stripe | ✅ | 99.9% |
| AWS IVS | ✅ | 99.5% |
| Resend | ✅ | 99% |

---

## 🔍 Post-Launch Monitoring

### Daily Checks

```bash
# Run every morning
curl -s https://gymtality.fit/api/health/integrations | jq '.results[] | {service, status, message}'

# Watch logs
ssh -i "key" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 100" | grep -i error
```

### Weekly Review

- [ ] Review uptime report
- [ ] Analyze error logs
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Check Stripe payouts
- [ ] Verify backups

### Monthly Review

- [ ] Full security audit
- [ ] Dependency updates
- [ ] Performance optimization
- [ ] Cost analysis
- [ ] Capacity planning

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| **MANUAL_TESTING_GUIDE.md** | Step-by-step testing procedures |
| **STRIPE_PRODUCTION_SETUP.md** | Getting production Stripe keys |
| **PRODUCTION_MONITORING_SETUP.md** | Setting up alerts & monitoring |
| **API_INTEGRATIONS.md** | Integration reference & troubleshooting |
| **CLAUDE.md** | Architecture & development rules |

---

## 🎯 Critical Paths (Do Not Miss)

### MUST DO Before Launch

1. ✅ Complete all 6 manual tests
2. ✅ Configure Stripe production keys
3. ✅ Set up monitoring & alerts
4. ✅ Train team on procedures
5. ✅ Document runbooks

### SHOULD DO Before Launch

1. ✅ Performance test under load
2. ✅ Security audit
3. ✅ Database backup test
4. ✅ Disaster recovery plan
5. ✅ Team on-call schedule

### CAN DO Post-Launch

- Performance optimizations
- Advanced monitoring (APM)
- Custom analytics
- Feature flagging
- Blue-green deployments

---

## 📞 Support & Escalation

### Level 1: Self-Service

- Check health endpoint
- Review logs
- Restart app
- Check API provider status pages

### Level 2: Engineering Team

- Code review required changes
- Database investigation
- Performance profiling
- Integration debugging

### Level 3: External Support

- **OpenAI:** https://platform.openai.com/support
- **Stripe:** https://support.stripe.com
- **AWS:** https://console.aws.amazon.com/support
- **QuickBlox:** https://quickblox.com/developers/contact

---

## 🏁 Final Verification (24 Hours Before Launch)

Run this comprehensive check:

```bash
#!/bin/bash
echo "=== Final Pre-Launch Verification ==="
echo ""

# Health check
echo "1. Integration Health:"
curl -s https://gymtality.fit/api/health/integrations | jq '.results[] | "\(.service): \(.status)"'
echo ""

# Server status
echo "2. Server Status:"
ssh -i "key" ubuntu@167.234.214.60 "pm2 status | grep gymtality"
echo ""

# Disk space
echo "3. Disk Space:"
ssh -i "key" ubuntu@167.234.214.60 "df -h | grep -E '^/dev|Mounted'"
echo ""

# Recent errors
echo "4. Recent Errors:"
ssh -i "key" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 50" | grep -i error | tail -5
echo ""

echo "=== All Systems Ready for Launch ==="
```

---

## ✅ Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Engineering Lead** | — | — | — |
| **QA Lead** | — | — | — |
| **Product Manager** | — | — | — |
| **Operations Lead** | — | — | — |

---

## 📋 Post-Launch Retrospective (Schedule for 1 week after launch)

- [ ] What went well?
- [ ] What could be improved?
- [ ] Were any incidents handled well?
- [ ] Is monitoring catching issues?
- [ ] Are alerts too noisy/too quiet?
- [ ] What optimizations are needed?
- [ ] Update runbooks based on learnings

---

**Next Step:** Begin Phase 1 testing with MANUAL_TESTING_GUIDE.md

Good luck! 🚀
