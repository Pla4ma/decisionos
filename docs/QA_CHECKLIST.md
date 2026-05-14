# DecisionOS — Manual QA Checklist

## Purpose

This document provides a comprehensive manual QA checklist for testing DecisionOS before releases.

---

## Pre-Release QA Flow

### 1. Authentication Flow

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1.1 | Open app fresh | Splash/onboarding screen appears | ☐ |
| 1.2 | Navigate to sign up | Sign up form displays | ☐ |
| 1.3 | Enter invalid email | Validation error shown | ☐ |
| 1.4 | Enter weak password | Password requirements shown | ☐ |
| 1.5 | Create valid account | Account created, navigated to home | ☐ |
| 1.6 | Sign out | Returns to auth screen | ☐ |
| 1.7 | Sign in with wrong password | Error message displayed | ☐ |
| 1.8 | Sign in with correct credentials | Successfully logged in | ☐ |

### 2. Onboarding Flow

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.1 | First app launch | Onboarding screens shown | ☐ |
| 2.2 | Navigate through onboarding | All screens swipeable | ☐ |
| 2.3 | Select values | Values persisted | ☐ |
| 2.4 | Complete onboarding | Navigated to home | ☐ |
| 2.5 | Privacy settings | Memory toggle works | ☐ |

### 3. Decision Creation Flow

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1 | Tap "New Decision" | Create decision screen opens | ☐ |
| 3.2 | Submit empty form | Validation errors shown | ☐ |
| 3.3 | Enter short title (<5 chars) | "Title too short" error | ☐ |
| 3.4 | Enter long title (>200 chars) | "Title too long" error | ☐ |
| 3.5 | Select category | Category selected | ☐ |
| 3.6 | Set importance/urgency | Sliders work correctly | ☐ |
| 3.7 | Add context | Context saved | ☐ |
| 3.8 | Continue to options | Options screen appears | ☐ |
| 3.9 | Add single option | "Need at least 2 options" error | ☐ |
| 3.10 | Add 2 valid options | Can proceed | ☐ |
| 3.11 | Add pros/cons to option | Pros/cons saved | ☐ |
| 3.12 | Continue to questions | Question screen appears | ☐ |
| 3.13 | Answer guided questions | Answers saved | ☐ |
| 3.14 | Submit for analysis | Decision saved, analysis queued | ☐ |

### 4. AI Analysis Flow

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.1 | View decision with "ready_for_analysis" status | "Run AI Analysis" button shown | ☐ |
| 4.2 | Tap "Run AI Analysis" | Loading state shown | ☐ |
| 4.3 | Analysis completes | Report displayed with scores | ☐ |
| 4.4 | View option comparison | All options scored | ☐ |
| 4.5 | View recommendation | Top option highlighted | ☐ |
| 4.6 | Free user after 3 analyses | "Upgrade" prompt shown | ☐ |
| 4.7 | Plus user | Unlimited analyses | ☐ |

### 5. Decision Choice Flow

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.1 | From analysis, tap "Choose Option" | Commit screen opens | ☐ |
| 5.2 | View options | All options listed with radio buttons | ☐ |
| 5.3 | Select option | Option selected, confirmation card shows | ☐ |
| 5.4 | Confirm choice | Dialog shown | ☐ |
| 5.5 | Confirm in dialog | Status updated to "chosen" | ☐ |
| 5.6 | Navigate to schedule | Schedule screen opens | ☐ |

### 6. Review Scheduling Flow

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.1 | View scheduling options | 1 week, 1 month, 3 months shown | ☐ |
| 6.2 | Select 1 week | Date preview updated | ☐ |
| 6.3 | Tap "Schedule Review" | Status updated to "review_scheduled" | ☐ |
| 6.4 | Return to decision detail | Review due date shown | ☐ |

### 7. Review Completion Flow

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.1 | Tap "Complete Review" | Review screen opens | ☐ |
| 7.2 | Submit empty form | "Outcome notes required" error | ☐ |
| 7.3 | Enter short notes (<10 chars) | "Too short" error | ☐ |
| 7.4 | Set satisfaction score | Score selected (1-5) | ☐ |
| 7.5 | Select regret level | Level selected | ☐ |
| 7.6 | Answer "choose same again" | Yes/No selected | ☐ |
| 7.7 | Enter lessons learned | Optional field accepts text | ☐ |
| 7.8 | Toggle memory insight | Toggle works | ☐ |
| 7.9 | Submit review | Status updated to "reviewed" | ☐ |

### 8. Decision History Flow

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.1 | View decisions list | All decisions displayed | ☐ |
| 8.2 | Filter by status | Filter works | ☐ |
| 8.3 | Search decisions | Search works | ☐ |
| 8.4 | Tap decision | Detail screen opens | ☐ |
| 8.5 | View analysis | Analysis displayed | ☐ |
| 8.6 | View review (if completed) | Review displayed | ☐ |
| 8.7 | Edit draft | Can edit | ☐ |
| 8.8 | Delete decision | Confirm dialog, then deleted | ☐ |

### 9. Paywall & Monetization Flow

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.1 | Free user at analysis limit | "Upgrade" badge shown | ☐ |
| 9.2 | Tap "Upgrade" | Paywall opens | ☐ |
| 9.3 | View Plus features | All features listed | ☐ |
| 9.4 | Tap "Upgrade to Plus" | Purchase flow (mock in dev) | ☐ |
| 9.5 | Restore purchases | Restore works | ☐ |
| 9.6 | Plus user | "Unlimited" badge shown | ☐ |

### 10. Settings & Privacy Flow

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 10.1 | Open settings | Settings screen opens | ☐ |
| 10.2 | View account info | Email and tier displayed | ☐ |
| 10.3 | Toggle memory | Toggle works, explanation shown | ☐ |
| 10.4 | Toggle notifications | Toggle works | ☐ |
| 10.5 | View security section | All security items listed | ☐ |
| 10.6 | Export data (Coming Soon) | Dialog shown | ☐ |
| 10.7 | Sign out | Confirm dialog, then signed out | ☐ |
| 10.8 | Delete account (Coming Soon) | Dialog shown | ☐ |

### 11. AI Safety & Crisis Detection

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 11.1 | Create decision with "suicide" | Safety warning shown | ☐ |
| 11.2 | Create decision with "chest pain" | Medical disclaimer shown | ☐ |
| 11.3 | Create decision with "arrested" | Legal disclaimer shown | ☐ |
| 11.4 | Create decision with "Bitcoin" | Investment disclaimer shown | ☐ |
| 11.5 | Create normal decision | No warnings, proceeds normally | ☐ |

### 12. Edge Cases & Error States

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.1 | Network error during save | Error message, retry option | ☐ |
| 12.2 | Offline app launch | Offline state handled gracefully | ☐ |
| 12.3 | Rapid button taps | Debounced, no duplicate actions | ☐ |
| 12.4 | Very long decision title | Truncated appropriately | ☐ |
| 12.5 | Special characters in title | Handled correctly | ☐ |
| 12.6 | Device rotation | Layout adapts | ☐ |
| 12.7 | Dark mode | UI readable in dark mode | ☐ |

---

## Known Issues & Limitations

| Issue | Status | Planned Fix |
|-------|--------|-------------|
| Jest types not installed | ⬜️ Phase 16+ | Add @types/jest |
| Integration tests require test DB | ⬜️ Phase 16+ | Set up Supabase test instance |
| E2E tests require build pipeline | ⬜️ Phase 16+ | Configure Detox/Maestro |

---

## Release Sign-off

| Check | Verified |
|-------|----------|
| All P0 flows working | ☐ |
| No critical bugs | ☐ |
| Schema tests passing | ☐ |
| Manual QA complete | ☐ |
| Security review done | ☐ |
| Performance acceptable | ☐ |

**QA Engineer:** _________________ **Date:** _________________

**Approved for Release:** ☐ Yes ☐ No

---

## Document History

| Date | Change |
|------|--------|
| 2026-05-03 | Created for Phase 15 |
