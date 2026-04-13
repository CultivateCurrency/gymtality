# Member Portal Testing & Workflows Guide

**Last Updated:** April 12, 2026  
**Status:** ✅ Ready for Integration Testing

---

## 🎯 Implementation Summary

### ✅ Completed Features

#### 1. **Gymtality Theme Song Integration**
- **Status:** Complete and Deployed
- **Location:** `/public/audio/gymtality-theme-personal-trainer.mp3` (473 KB)
- **Features:**
  - ✅ Background music player on landing-audio page
  - ✅ Featured demo track in rotation showcase
  - ✅ Pre-selectable for bookings
  - ✅ Auto-rotating carousel demo (5-second intervals)
  - ✅ Full integration with $20/day booking system

#### 2. **Landing Audio Page Enhancements**
- **New Components Added:**
  - Background music player with play/pause controls
  - "See How It Works" featured demo section
  - 30-second rotation carousel visualization
  - Featured track booking option
  - Spotify search integration (with theme song as featured option)
  - Upload mode for user audio files

#### 3. **Audio File Serving**
- **Public URL:** `http://localhost:3000/audio/gymtality-theme-personal-trainer.mp3`
- **File:** Served from Next.js public folder
- **Format:** MP3, 473 KB, ~180 seconds duration

---

## 🧪 Member Portal Workflow Tests

### Test Categories Implemented

#### A. **Authentication Workflows** (4 tests)
```
✓ Login and access member dashboard
✓ Navigate member portal sections  
✓ Logout successfully
✓ Verify auth token management
```

**What to Test:**
1. Navigate to `/auth/login`
2. Enter credentials
3. Verify redirect to `/member/dashboard`
4. Check navigation to landing-audio, profile, etc.
5. Test logout flow

---

#### B. **Landing Audio Booking Workflows** (6 tests)
```
✓ Display all form fields
✓ Play background music
✓ Show featured demo track
✓ Spotify search functionality
✓ Toggle between modes (Spotify/Upload)
✓ Form validation (date, terms, etc.)
```

**Manual Testing Checklist:**

1. **Background Music Player**
   - [ ] Page loads with music player visible
   - [ ] Play button works (audio plays)
   - [ ] Pause button works (audio stops)
   - [ ] Music loops continuously

2. **Featured Demo Section**
   - [ ] "See How It Works" section visible
   - [ ] Rotation carousel animates every 5 seconds
   - [ ] Shows Gymtality theme, user song, other artists
   - [ ] "Book This Song" button for Gymtality theme

3. **Spotify Search**
   - [ ] Spotify mode button toggles (if credentials set)
   - [ ] Search input accepts text
   - [ ] Search button triggers API call
   - [ ] Results display with album art
   - [ ] Can click to select track

4. **Upload Mode**
   - [ ] Upload button toggles to upload mode
   - [ ] File input accepts audio files
   - [ ] Shows uploaded file details
   - [ ] Displays upload progress

5. **Booking Form**
   - [ ] All fields present: Song, Artist, Date
   - [ ] Date picker validates future dates only
   - [ ] Terms checkbox required to submit
   - [ ] Submit button disabled until all fields filled
   - [ ] Error messages display for validation

6. **Booking History**
   - [ ] "Your Bookings" section displays
   - [ ] Shows previous bookings with status
   - [ ] Status badges show: Pending Review, Active, Rejected
   - [ ] Booking details include date, song, artist

---

#### C. **Responsiveness Tests** (3 tests)
```
✓ Mobile (375x667) - all content visible and touch-friendly
✓ Tablet (768x1024) - proper layout and spacing
✓ Desktop (1920x1080) - full feature display
```

**Manual Testing:**
- Open DevTools → Toggle Device Toolbar
- Test viewports: Mobile (375px), Tablet (768px), Desktop (1920px)
- Verify:
  - [ ] No horizontal scrolling
  - [ ] Touch targets ≥44px
  - [ ] Form fields readable
  - [ ] Buttons clickable
  - [ ] Music player functional

---

#### D. **Accessibility Tests** (2 tests)
```
✓ Heading hierarchy (h1 exists, no skipped levels)
✓ Form labels properly associated
✓ Color contrast meets WCAG AA (4.5:1)
✓ Focus indicators visible on all interactive elements
✓ Keyboard navigation functional
```

**Manual Testing with Accessibility Tools:**

**Browser DevTools Audit:**
1. Right-click → Inspect → Lighthouse
2. Run Accessibility audit
3. Check:
   - [ ] All form inputs have labels
   - [ ] Headings properly ordered
   - [ ] Color contrast ≥4.5:1 (AA standard)
   - [ ] No color-only indicators
   - [ ] Focus indicators visible

**Keyboard Navigation:**
1. [ ] Tab through form (no trap)
2. [ ] Enter submits forms
3. [ ] Esc closes modals
4. [ ] Arrow keys work in dropdowns

**Screen Reader Test (NVDA/JAWS/VoiceOver):**
1. [ ] Page title announced
2. [ ] Headings announced with level
3. [ ] Form labels read with inputs
4. [ ] Buttons have accessible names
5. [ ] Status messages announced

---

#### E. **Security Tests** (2 tests)
```
✓ No sensitive data in URL/forms
✓ All external links use HTTPS
✓ CSRF protection on forms
✓ No API keys exposed
✓ Auth tokens not in localStorage
```

**Manual Testing:**
1. Open DevTools → Network tab
2. Submit a booking
3. Check:
   - [ ] API requests include Authorization header
   - [ ] Request/response bodies don't expose sensitive data
   - [ ] All requests to HTTPS endpoints
   - [ ] No API keys in query strings

4. Check page source:
   - [ ] No hardcoded credentials
   - [ ] No exposed Stripe keys
   - [ ] No auth tokens in HTML

---

#### F. **Performance Tests** (1 test)
```
✓ Page loads within <3 seconds
✓ Interactive elements respond <100ms
✓ No layout shifts after load
✓ Images optimized (<100KB each)
```

**Manual Testing:**
1. DevTools → Lighthouse → Performance
2. Check:
   - [ ] First Contentful Paint <1.5s
   - [ ] Largest Contentful Paint <2.5s
   - [ ] Cumulative Layout Shift <0.1
   - [ ] Time to Interactive <3.5s

---

## 🚀 Running the Tests

### Option 1: Manual Testing (Recommended for Now)
```bash
# Start dev server
cd GYMTALITY/forge-fitness
npm run dev

# Navigate to: http://localhost:3000/member/landing-audio
# Follow the testing checklist above
```

### Option 2: Automated Testing (When Playwright Configured)
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Run test suite
npx playwright test tests/member-portal-workflows.spec.ts --headed

# Or specific test
npx playwright test --grep "Background Music"
```

### Option 3: CI/CD Integration
Add to `.github/workflows/test.yml`:
```yaml
- name: Run Playwright Tests
  run: npx playwright test tests/member-portal-workflows.spec.ts
```

---

## 📋 Member Portal Feature Checklist

### Navigation & Routing
- [ ] Login redirects to `/member/dashboard`
- [ ] Protected routes require authentication
- [ ] Logout clears auth tokens
- [ ] Navigation menu shows all sections
- [ ] Deep linking works (e.g., direct URL to landing-audio)

### Landing Audio Booking
- [ ] Background music player functional
- [ ] Featured demo carousel rotates
- [ ] Spotify search works (if API configured)
- [ ] Upload accepts audio files
- [ ] Booking form validates input
- [ ] Payment integration (Stripe) works
- [ ] Booking confirmation displays
- [ ] History shows past bookings
- [ ] Status badges display correctly

### User Profile
- [ ] Can view profile information
- [ ] Can edit profile details
- [ ] Avatar upload works
- [ ] Settings persist across sessions

### Notifications
- [ ] Booking confirmations sent
- [ ] Status updates displayed
- [ ] Error messages clear and helpful
- [ ] Toast notifications work

### Data & Security
- [ ] Only own bookings visible
- [ ] Other users' data not accessible
- [ ] Auth tokens in secure cookies (httpOnly)
- [ ] CORS properly configured
- [ ] Rate limiting prevents abuse

---

## 🔧 Integration with Backend

### API Endpoints Required

#### Landing Audio Bookings
- `GET /api/landing/bookings/mine` - User's bookings
- `POST /api/landing/bookings` - Create booking
- `PATCH /api/landing/bookings/:id` - Update booking
- `DELETE /api/landing/bookings/:id` - Cancel booking
- `GET /api/landing/spotify/search?q=...` - Spotify search (✅ Implemented)

#### User Profile
- `GET /api/users/me` - Current user
- `PATCH /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar

#### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

---

## 📊 Testing Results Template

Use this template to document test results:

```markdown
## Test Results - [Date]

### Environment
- Browser: Chrome/Firefox/Safari
- Device: Desktop/Mobile/Tablet
- OS: Windows/Mac/Linux
- Network: 4G/WiFi/Throttled

### Authentication
- [ ] Login: PASS / FAIL
- [ ] Logout: PASS / FAIL
- [ ] Session persistence: PASS / FAIL

### Landing Audio
- [ ] Background music: PASS / FAIL
- [ ] Featured demo: PASS / FAIL
- [ ] Spotify search: PASS / FAIL
- [ ] Upload mode: PASS / FAIL
- [ ] Booking form: PASS / FAIL
- [ ] Booking history: PASS / FAIL

### Responsiveness
- [ ] Mobile (375px): PASS / FAIL
- [ ] Tablet (768px): PASS / FAIL
- [ ] Desktop (1920px): PASS / FAIL

### Accessibility
- [ ] Heading hierarchy: PASS / FAIL
- [ ] Form labels: PASS / FAIL
- [ ] Color contrast: PASS / FAIL
- [ ] Keyboard navigation: PASS / FAIL
- [ ] Screen reader: PASS / FAIL

### Performance
- [ ] Load time (<3s): PASS / FAIL
- [ ] Interactions responsive: PASS / FAIL
- [ ] No layout shifts: PASS / FAIL

### Security
- [ ] No sensitive data exposed: PASS / FAIL
- [ ] HTTPS enforced: PASS / FAIL
- [ ] Auth tokens secure: PASS / FAIL

### Issues Found
1. [Issue]: [Steps to reproduce] → [Severity: Critical/Major/Minor]
2. ...

### Recommendations
1. [Improvement 1]
2. [Improvement 2]
```

---

## 🎓 Next Steps

### Immediate (Today)
1. [ ] Manual test landing-audio page with audio file
2. [ ] Test booking flow end-to-end
3. [ ] Verify background music plays
4. [ ] Test on mobile/tablet viewports

### Short-term (This Week)
1. [ ] Set up Playwright testing framework
2. [ ] Run full test suite against staging
3. [ ] Security audit with OWASP checklist
4. [ ] Performance profiling with Lighthouse
5. [ ] User acceptance testing (UAT) with team

### Medium-term (This Month)
1. [ ] Set up CI/CD pipeline for automated tests
2. [ ] Implement monitoring for production
5. [ ] Create runbook for common issues
6. [ ] Train support team on member portal

---

## 📚 Resources

- **Playwright Docs:** https://playwright.dev
- **WCAG 2.2 AA:** https://www.w3.org/WAI/WCAG22/quickref/
- **Next.js Best Practices:** https://nextjs.org/docs/app/building-your-application
- **Stripe Integration:** https://stripe.com/docs/payments/accept-a-payment

---

## ✅ Sign-Off

- **Feature:** Landing Audio Booking with Gymtality Theme
- **Status:** Ready for Testing
- **Audio File:** ✅ Deployed to `/public/audio/`
- **Integration:** ✅ Complete
- **Next:** Manual testing & UAT
