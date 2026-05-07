# Production Monitoring Setup Guide

**Environment:** https://gymtality.fit  
**Monitoring Priority:** Critical  
**Setup Time:** 10-15 minutes

---

## Overview

This guide helps you monitor integrations, uptime, and performance to catch issues before users do.

---

## 1. Health Check Monitoring

### Basic: Manual Health Checks

**Frequency:** Every 5 minutes (recommended)  
**Method:** Browser or curl

```bash
# Check all integrations
curl https://gymtality.fit/api/health/integrations

# Expected: HTTP 200 with all services passing
```

### Advanced: Automated Health Check (Cron)

Set up a recurring check that alerts you if integrations fail:

```bash
# On your local machine, create a monitoring script:
cat > /tmp/monitor-gymtality.sh << 'EOF'
#!/bin/bash

STATUS=$(curl -sk https://gymtality.fit/api/health/integrations 2>/dev/null | grep -o '"failed":[0-9]')
FAILED=$(echo $STATUS | grep -o '[0-9]$')

if [ "$FAILED" -gt 0 ]; then
  echo "⚠️ ALERT: $FAILED integration(s) failing at $(date)"
  # You could also send email or Slack notification here
  exit 1
else
  echo "✅ All integrations healthy at $(date)"
  exit 0
fi
EOF

chmod +x /tmp/monitor-gymtality.sh

# Test it
/tmp/monitor-gymtality.sh

# Add to crontab to run every 5 minutes:
# (crontab -l 2>/dev/null; echo "*/5 * * * * /tmp/monitor-gymtality.sh") | crontab -
```

---

## 2. Server Uptime Monitoring

### Option A: Uptime.com (Recommended)

**Cost:** Free tier available  
**Setup:** 2 minutes

1. **Go to** https://uptime.com (create account if needed)
2. **Click** "Add Monitor" or "New Uptime Monitor"
3. **Configure:**
   - **URL:** `https://gymtality.fit/api/health/integrations`
   - **Check Interval:** Every 5 minutes
   - **Timeout:** 30 seconds
   - **Request Method:** GET
   - **Expected Status:** 200 or 503 (either is OK; 503 means 1 integration failing)
4. **Add Notifications:**
   - Email (your email)
   - Slack webhook (optional)
   - SMS (optional, paid feature)
5. **Click** "Create Monitor"

### Option B: StatusCake (Alternative)

**Cost:** Free tier available  
**Setup:** 2 minutes

1. **Go to** https://www.statuscake.com
2. **Create account** and verify email
3. **Add new uptime check:**
   - **URL:** `https://gymtality.fit`
   - **Check Interval:** 5 minutes
   - **Notifications:** Email
4. **Save**

### Option C: Simple Curl Cron (DIY)

Add this to your server's crontab:

```bash
# SSH into server
ssh -i "key" ubuntu@167.234.214.60

# Edit crontab
crontab -e

# Add this line to check every 5 minutes:
*/5 * * * * curl -sk https://gymtality.fit/api/health/integrations > /tmp/health-check.log 2>&1

# View logs:
tail -f /tmp/health-check.log
```

---

## 3. Log Monitoring

### Real-Time Logs

```bash
# Watch server logs in real-time
ssh -i "key" ubuntu@167.234.214.60 "pm2 logs gymtality"

# Or tail the last 100 lines:
ssh -i "key" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 100"

# Filter by errors:
ssh -i "key" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 200" | grep -i error
```

### Set Up Log Alerts

```bash
# Create a script to monitor logs for errors
cat > /tmp/log-monitor.sh << 'EOF'
#!/bin/bash

ssh -i "path-to-key" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 50" | grep -i "error\|failed\|exception" && echo "❌ ERROR found in logs!" || echo "✅ No errors in recent logs"
EOF

chmod +x /tmp/log-monitor.sh

# Add to crontab (check every 10 minutes):
# (crontab -l 2>/dev/null; echo "*/10 * * * * /tmp/log-monitor.sh >> /var/log/gymtality-monitor.log 2>&1") | crontab -
```

---

## 4. Performance Monitoring

### Response Time Monitoring

```bash
# Test response times
cat > /tmp/perf-monitor.sh << 'EOF'
#!/bin/bash

echo "Testing response times..."

# Homepage
TIME=$(curl -sk -o /dev/null -w '%{time_total}' https://gymtality.fit/)
echo "Homepage: ${TIME}s"

# Health check
TIME=$(curl -sk -o /dev/null -w '%{time_total}' https://gymtality.fit/api/health/integrations)
echo "Health Check: ${TIME}s"

# API endpoint
TIME=$(curl -sk -X POST https://gymtality.fit/api/auth/login -H 'Content-Type: application/json' -d '{}' -o /dev/null -w '%{time_total}')
echo "Login Endpoint: ${TIME}s"

# Alert if any is > 5 seconds
if (( $(echo "$TIME > 5" | bc -l) )); then
  echo "⚠️ SLOW RESPONSE: Check server performance"
fi
EOF

chmod +x /tmp/perf-monitor.sh
/tmp/perf-monitor.sh
```

### Add to Crontab

```bash
# Check performance every 15 minutes
# (crontab -l 2>/dev/null; echo "*/15 * * * * /tmp/perf-monitor.sh >> /var/log/perf-monitor.log 2>&1") | crontab -
```

---

## 5. Error Rate Monitoring

### Check for API Errors

```bash
# Count 5xx errors in last hour
ssh -i "key" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 1000" | grep -c "500\|503\|502"

# If > 5, something is wrong
```

### Create an Error Dashboard

```bash
# Simple script to show error stats
cat > /tmp/error-stats.sh << 'EOF'
#!/bin/bash

echo "=== Error Statistics (Last 100 logs) ==="
LOGS=$(ssh -i "$1" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 100" 2>/dev/null)

echo "5xx Errors: $(echo "$LOGS" | grep -c '500\|502\|503')"
echo "4xx Errors: $(echo "$LOGS" | grep -c '400\|401\|403\|404')"
echo "Timeouts: $(echo "$LOGS" | grep -c 'timeout\|TIMEOUT')"
echo "DB Errors: $(echo "$LOGS" | grep -c 'database\|db\|Database')"
echo "API Errors: $(echo "$LOGS" | grep -c 'API\|api\|Error')"
EOF

chmod +x /tmp/error-stats.sh
/tmp/error-stats.sh "path-to-key"
```

---

## 6. Integration Status Dashboard

### Create Manual Dashboard

Create a simple HTML file to check all integrations:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Gymtality Health Check</title>
  <style>
    body { font-family: Arial; margin: 20px; }
    .status { padding: 10px; margin: 5px; border-radius: 5px; }
    .success { background: #90EE90; }
    .failed { background: #FFB6C6; }
    .pending { background: #FFE4B5; }
  </style>
</head>
<body>
  <h1>Gymtality Production Status</h1>
  <div id="status">Loading...</div>
  
  <script>
    fetch('https://gymtality.fit/api/health/integrations')
      .then(r => r.json())
      .then(data => {
        let html = `<p>Last checked: ${new Date(data.timestamp).toLocaleString()}</p>`;
        data.results.forEach(r => {
          const className = r.status === 'success' ? 'success' : r.status === 'failed' ? 'failed' : 'pending';
          html += `<div class="status ${className}">
            <strong>${r.service}</strong>: ${r.status.toUpperCase()}
            <br><small>${r.message}</small>
          </div>`;
        });
        document.getElementById('status').innerHTML = html;
      });
  </script>
</body>
</html>
```

Save as `monitor.html` and open in browser to get quick status view.

---

## 7. Alerting Strategy

### Email Alerts

```bash
# Create alert script
cat > /tmp/alert-email.sh << 'EOF'
#!/bin/bash

# Check health
STATUS=$(curl -sk https://gymtality.fit/api/health/integrations | grep -o '"failed":[0-9]')
FAILED=$(echo $STATUS | grep -o '[0-9]$')

if [ "$FAILED" -gt 0 ]; then
  # Send email alert
  echo "Integration Check Failed - $FAILED service(s) down" | mail -s "🚨 Gymtality Alert" your-email@example.com
fi
EOF
```

### Slack Alerts

```bash
# Create Slack webhook alert
cat > /tmp/alert-slack.sh << 'EOF'
#!/bin/bash

WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Check health
STATUS=$(curl -sk https://gymtality.fit/api/health/integrations)
FAILED=$(echo $STATUS | grep -o '"failed":[0-9]' | grep -o '[0-9]$')

if [ "$FAILED" -gt 0 ]; then
  curl -X POST $WEBHOOK_URL \
    -H 'Content-type: application/json' \
    -d "{\"text\":\"🚨 Gymtality Alert: $FAILED integration(s) failing\"}"
fi
EOF
```

---

## 8. Quick Status Commands (Bookmark These)

```bash
# Status check (run manually anytime)
curl https://gymtality.fit/api/health/integrations | jq

# Server status
ssh -i "key" ubuntu@167.234.214.60 "pm2 status"

# Recent errors
ssh -i "key" ubuntu@167.234.214.60 "pm2 logs gymtality --lines 50" | grep -i error

# Memory usage
ssh -i "key" ubuntu@167.234.214.60 "pm2 monit"

# Restart if needed
ssh -i "key" ubuntu@167.234.214.60 "pm2 restart gymtality"
```

---

## 9. Monitoring Checklist

- [ ] Set up uptime monitor (Uptime.com or StatusCake)
- [ ] Create health check cron job
- [ ] Set up email/Slack alerts
- [ ] Create log monitoring script
- [ ] Set up performance monitoring
- [ ] Test alert system (verify you get notified)
- [ ] Bookmark quick status commands
- [ ] Train team on monitoring procedures
- [ ] Set escalation procedures (who to contact if down)

---

## 10. What to Monitor (Priority Order)

### 🔴 Critical (Alert Immediately)
- Website down (HTTP 500, 502, 503)
- All integrations failing
- Database connection errors
- Payment processing failing
- User authentication broken

### 🟠 High (Alert Within 5 min)
- Single integration failing (OpenAI, Stripe, etc.)
- Response time > 5 seconds
- Error rate > 1%
- Rate limiting triggering too often

### 🟡 Medium (Alert Within 15 min)
- High memory usage (> 80%)
- High CPU usage (> 75%)
- Slow API responses (1-5 seconds)
- Unusual traffic patterns

### 🟢 Low (Check During Business Hours)
- Deprecation warnings
- Minor error logs
- Performance optimizations
- Security updates

---

## Incident Response Checklist

**When alert fires:**

1. ✅ Check health endpoint: `curl https://gymtality.fit/api/health/integrations`
2. ✅ Check server logs: `pm2 logs gymtality --lines 100`
3. ✅ Check which integration is failing
4. ✅ Check API provider status pages
5. ✅ If API issue: contact provider support
6. ✅ If server issue: check resources (CPU, memory, disk)
7. ✅ If code issue: check recent deployments
8. ✅ Restart if safe: `pm2 restart gymtality`
9. ✅ Document the incident
10. ✅ Post-mortem: what caused it? How to prevent next time?

---

## Tools Comparison

| Tool | Cost | Setup | Features |
|------|------|-------|----------|
| **Uptime.com** | Free/Paid | 2 min | HTTP checks, alerts, uptime % |
| **StatusCake** | Free/Paid | 2 min | Website monitoring, reports |
| **Datadog** | Paid | 5 min | Full observability, metrics |
| **New Relic** | Paid | 5 min | APM, error tracking |
| **DIY + Cron** | Free | 10 min | Custom monitoring scripts |

**Recommendation for MVP:** Start with Uptime.com (free) + DIY cron jobs

---

## Next Steps

1. ✅ Choose uptime monitoring tool
2. ✅ Set up email/Slack alerts
3. ✅ Create monitoring cron jobs
4. ✅ Test alert system
5. ✅ Document runbooks for common issues
6. ✅ Train team on monitoring procedures

---

**Status:** Ready to monitor production 🚀
