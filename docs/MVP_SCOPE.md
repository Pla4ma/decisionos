# DecisionOS — MVP Scope

Clear boundaries for what is IN and OUT of the Minimum Viable Product.

---

## MVP Includes

These features are required for the initial release:

| Feature | Description |
|---------|-------------|
| **Auth** | Email/password and social auth via Supabase |
| **Onboarding** | Privacy-first introduction and values clarification |
| **Home screen** | Dashboard with recent decisions and quick actions |
| **Create decision** | Form to define a new decision with title and context |
| **Add options** | Multiple choice options for each decision |
| **Guided questions** | Structured prompts to clarify thinking |
| **Gemini analysis** | AI-powered scoring and comparison of options |
| **Decision scores** | Visual comparison of option scores with explanations |
| **Saved history** | List of all past decisions |
| **Decision detail** | Full view of a saved decision with analysis |
| **Decision review/check-in** | Outcome tracking and learning loop |
| **Settings** | Account, privacy, and preferences management |
| **Dark mode** | Premium dark theme throughout |
| **RevenueCat foundation** | Subscription infrastructure ready |
| **Free usage limits** | Usage caps for free tier |
| **Plus plan** | Paid tier with expanded limits |
| **Safe analytics** | Feature usage tracking without sensitive content |
| **Privacy basics** | Data handling that respects user privacy |

---

## MVP Excludes

These features are explicitly banned from MVP. They may come in v2 or NeuroFlow:

| Excluded | Reason |
|----------|--------|
| **Full NeuroFlow** | MVP is decisions only; broader ecosystem later |
| **Team features** | Single-user only for MVP |
| **Enterprise** | Consumer focus first |
| **Marketplace** | No external integrations or content marketplace |
| **Blockchain** | No web3 or token elements |
| **Quantum** | No quantum computing features |
| **AR/VR** | No immersive or spatial features |
| **Social feed** | No public sharing or social graph |
| **Public profiles** | Private-only for MVP |
| **Medical advice** | No health-related guidance |
| **Legal advice** | No legal recommendations |
| **Mental health crisis support** | No therapy or crisis intervention |
| **Investment advice** | No financial or securities guidance |
| **Full habit tracker** | Decisions only, not habits |
| **Full finance tracker** | No comprehensive financial management |

---

## Scope Decision Framework

When uncertain whether to include a feature, ask:

1. **Does this directly support the core decision loop?**
   - Yes → Consider for MVP
   - No → Likely exclude

2. **Can the product work without this?**
   - Yes → Probably exclude from MVP
   - No → Must include

3. **Is this a NeuroFlow feature?**
   - Yes → Document for future, don't build now
   - No → Evaluate against decision loop

---

## Future Phases (Post-MVP)

These are documented but not implemented:

### v2 Enhancements
- More question templates
- Decision categories/tags
- Export functionality
- Enhanced analytics

### NeuroFlow Ecosystem (Future)
- Habit integration
- Biometric data
- Career tools
- Financial optimization
- Team collaboration
- Enterprise features

---

## Document History

| Date | Change |
|------|--------|
| 2026-05-03 | Initial creation as part of Phase 0 |
