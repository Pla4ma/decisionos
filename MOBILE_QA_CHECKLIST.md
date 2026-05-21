# Mobile QA Checklist — DecisionOS

## Prerequisites
- [ ] Built and installed on physical iOS/Android device (not simulator)
- [ ] Tested on both iOS and Android
- [ ] Network: switch between WiFi and cellular
- [ ] Fresh install (no cached data)

## 1. Quick Decision
- [ ] Tap "Quick Decision" from home → navigates to `/decisions/new?quick=true`
- [ ] Form renders: title, category, urgency, option A, option B, optional fields
- [ ] Title validation: minimum 2 chars, create button disabled until valid
- [ ] Create button works → decision saved → navigates to detail screen
- [ ] Decision appears in history list
- [ ] Works offline → shows error gracefully, no crash
- [ **CODE REVIEW** ] No empty catch blocks in QuickDecisionForm.tsx → FIXED (TASK 6)
- [ **CODE REVIEW** ] Error message shown on save failure → FIXED (TASK 6)

## 2. Full Decision Wizard
- [ ] Tap "Full Analysis" from home → navigates to `/decisions/new`
- [ ] Step 1 (Basics): title, category, context, outcome, fear, inaction, importance/urgency sliders
- [ ] Step 2 (Options): add/edit/remove options with pros/cons
- [ ] Step 3 (Questions): reflection questions, bias detection
- [ ] Step 4 (Review): summary of all inputs, save button visible
- [ ] Save → creates decision with all options + answers → navigates to detail
- [ ] **Keyboard Avoidance**: keyboard does not hide form fields → FIXED (TASK 5)
- [ ] **Scroll**: long forms scroll properly on small screens → FIXED (TASK 5)
- [ ] **Save button**: visible on review step, not cut off → FIXED (TASK 5)
- [ ] **Validation errors**: visible above keyboard → FIXED (TASK 5)
- [ **CODE REVIEW** ] No empty catch blocks → CONFIRMED
- [ **CODE REVIEW** ] `setSaveError` shown in error banner → CONFIRMED

## 3. AI Analysis
- [ ] Decision with status `ready_for_analysis` → "Get AI Analysis" button appears
- [ ] Tap analyze → loading state → analysis displays
- [ ] Analysis shows option scores, summary, recommended option
- [ ] Analysis persists across app restarts
- [ ] Free tier limit enforcement: shows upgrade prompt when exhausted

## 4. Review Loop
- [ ] "Make Choice" button navigates to commit screen
- [ ] Commit screen: select an option → decision status becomes `chosen`
- [ ] Schedule review: date picker works → status `review_scheduled`
- [ ] Review screen: satisfaction score, would choose same, notes
- [ ] Completed review → status `reviewed`
- [ ] Quick check-in (48h) prompt appears after commit

## 5. Settings — Privacy
- [ ] Settings screen loads without errors
- [ ] "Delete Account" action exists and shows confirmation
- [ ] Delete triggers `delete_user_data` RPC → signs out
- [ ] "Export Data" returns JSON with all user tables
- [ ] If paywall is shown, it uses RevenueCat (no fake paywall) → See §6
- [ ] Subscription restore works

## 6. No Fake Paywall
- [ ] Paywall screen does NOT mock purchase flow
- [ ] "Subscribe" buttons either integrate RevenueCat or navigate to actual App Store purchase
- [ ] Free tier features are usable without paywall
- [ ] No features locked behind imaginary tiers
- [ ] "Restore purchases" uses native restore API
- [ **CODE REVIEW** ] Paywall screen (`src/app/paywall/index.tsx`): `setTimeout` mock — **FLAGGED** for real RevenueCat integration
- [ ] No airlock/feature flags that silently break without payment

## 7. Navigation
- [ ] All route strings use ROUTES constants → FIXED (TASK 1)
- [ ] No `ROUTES.DECISION_EDIT` exists → REMOVED (TASK 2)
- [ ] Notification tap verifies decision ownership → FIXED (TASK 3)
- [ ] Notification tap handles deleted decision → FIXED (TASK 3)

## 8. Edge Cases
- [ ] Rapid tapping "Create" does not duplicate the decision
- [ ] Back button during creation does not leave orphan drafts
- [ ] App backgrounded during save → no data loss
- [ ] Push notification with invalid ID → shows friendly fallback
- [ ] Network error during save → retryable error shown

## Verdict
- **DecisionOS 10/10**: All boxes checked, no crashes, no data loss, no fake paywall
