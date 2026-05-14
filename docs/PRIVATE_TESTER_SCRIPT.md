# DecisionOS — Private Tester Script

## Purpose

This document guides private testers through evaluating DecisionOS MVP. Please read completely before testing.

---

## What DecisionOS Does

**DecisionOS is a decision-making assistant, not a life coach or therapist.**

### Core Functionality
- **Structured Decision Creation**: Guides you through defining decisions, adding options, and answering category-specific questions
- **AI-Powered Analysis**: Uses Gemini AI to analyze your options across 5 dimensions (confidence, regret risk, values alignment, reversibility, risk)
- **Score-Based Recommendations**: Provides numerical scores and reasoning for each option
- **Review Loop**: Lets you track what actually happened and learn from your decisions
- **Memory Insights**: Shows patterns from your past reviewed decisions (when enabled)

### What Makes It Different
- **Privacy-First**: Your decision content never leaves the app server
- **Structured, Not Generic**: Uses specific decision frameworks, not chat-based AI
- **Learning Focus**: Designed to help you improve decision-making over time
- **Safety Boundaries**: Explicitly excludes medical, legal, and investment advice

### Current Scope
This is an MVP focused on personal decisions like:
- Career choices
- Financial decisions (personal, not investment advice)
- Moving/relocation decisions
- Business decisions
- Personal goals
- School/education decisions

---

## What Testers Should Try

### Complete Flow (30-45 minutes)
1. **Sign Up & Onboarding**
   - Create account with email
   - Complete onboarding screens
   - Set memory preferences

2. **Create Your First Decision**
   - Choose a real decision you're facing
   - Add 2-3 options
   - Answer the guided questions
   - Run AI analysis

3. **Review the Analysis**
   - Read the structured report
   - Check the scores and reasoning
   - Look at the comparison
   - Choose an option

4. **Schedule a Review**
   - Set a future review date
   - Complete the review flow (even if hypothetical)

5. **Explore the App**
   - Check your decision history
   - Look at settings
   - Try the paywall screen

### Specific Things to Test
- **Decision Creation Flow**: Is it clear what information is needed?
- **AI Analysis**: Does the analysis feel helpful and specific to your decision?
- **Scoring System**: Do the 5-dimensional scores make sense?
- **Review Process**: Is the outcome tracking meaningful?
- **Memory Feature**: Do the insights from past decisions feel useful?

### Edge Cases to Try
- Create a decision with only 2 options
- Try different decision categories
- Test the usage limit (you get 3 free analyses)
- Schedule multiple reviews

---

## What Feedback to Give

### Primary Questions
Please provide feedback on these key areas:

1. **Decision Flow Clarity**
   - Was it clear what information to provide?
   - Did the questions help you think through the decision?
   - Any confusing parts of the creation process?

2. **Analysis Usefulness**
   - Did the AI analysis help you think differently?
   - Were the recommendations reasonable?
   - Did the scores reflect your intuition about the options?

3. **Score System**
   - Do the 5 dimensions (confidence, regret risk, values alignment, reversibility, risk) make sense?
   - Were the score explanations helpful?
   - Did the scores help you compare options?

4. **AI Quality**
   - Did it feel like a generic ChatGPT response or tailored to your decision?
   - Was the tone appropriate?
   - Any responses that felt unsafe or overconfident?

5. **Real-World Use**
   - Would you use this for an actual decision?
   - What type of decisions would you use it for?
   - What would prevent you from using it?

6. **Payment Value**
   - What would make you pay for this?
   - Is the free tier generous enough?
   - Are the Plus features compelling?

7. **Confusion Points**
   - What was unclear or confusing?
   - Where did you get stuck?
   - What features did you expect but didn't find?

### General Feedback
- Overall impression of the app
- Bugs or technical issues encountered
- Suggestions for improvement
- Missing features you wish existed

---

## Known Limitations

### This is an MVP - Expect These Limitations:

**Technical Limitations:**
- RevenueCat integration is mocked (subscription UI works but no real payments)
- Memory insights use example data (not real pattern analysis yet)
- Some UI may feel rough around the edges

**Feature Limitations:**
- No export functionality yet
- Limited decision categories (no medical, legal, investment advice)
- No team collaboration features
- No web dashboard

**AI Limitations:**
- Analysis quality depends on how well you answer the questions
- May occasionally give generic-sounding responses
- Not suitable for crisis situations or professional advice

**Scope Limitations:**
- Designed for individuals, not organizations
- Focused on personal decisions, not business strategy
- English language only

### What We're Testing
- **Core Decision Flow**: Does the end-to-end process work?
- **AI Analysis Quality**: Is the analysis helpful and safe?
- **User Experience**: Is the app intuitive and valuable?
- **Monetization Fit**: Does the pricing model make sense?

### What We're NOT Testing
- Advanced features (future roadmap items)
- Enterprise functionality
- Professional use cases
- Multi-language support

---

## Privacy Note

### Your Data is Protected
- **Decision Content**: Never shared with third parties
- **Personal Information**: Only used for account functionality
- **Analytics**: Only metadata (decision counts, categories, not content)
- **AI Processing**: Happens on secure servers, content not used for training

### What We Collect
- Account email and basic profile
- Decision metadata (category, dates, scores - not content)
- Usage patterns (feature usage, session length)
- Feedback you provide

### What We DON'T Collect
- Your actual decision content
- Personal identifiers in analytics
- Location data
- Contact information beyond email

### Data Deletion
You can delete your account and all data at any time through settings.

---

## How to Report Bugs

### Bug Categories
1. **Critical**: App crashes, can't complete core flow
2. **Major**: Feature broken, significant usability issue
3. **Minor**: UI glitch, typo, small annoyance

### What to Include
- **Steps to Reproduce**: What you did before the bug occurred
- **Expected vs Actual**: What should have happened vs what did
- **Device/Platform**: iOS/Android version, device model
- **Screenshots**: If applicable (avoid showing personal decision content)

### How to Report
- Email: [testing email address]
- Include "DecisionOS Bug Report" in subject
- Mention your tester ID if you have one

---

## Testing Timeline

### Expected Testing Period: 2 weeks
- **Week 1**: Complete full flow, provide initial feedback
- **Week 2**: Try edge cases, provide follow-up feedback

### Feedback Schedule
- **Initial Feedback**: Within 48 hours of first use
- **Follow-up**: After 1 week of regular use
- **Final**: End of testing period

### Communication
- We may send follow-up questions about your feedback
- No spam, only testing-related communications
- You can opt out at any time

---

## Thank You

Your feedback is incredibly valuable for improving DecisionOS. We're building this to help people make better decisions, and honest testing feedback is essential.

Please be candid in your feedback - both positive and negative feedback helps us improve. There are no wrong answers about your experience.

---

## Contact Information

**Questions about testing?**
- Email: [testing email address]
- Response time: Within 24 hours

**Technical issues?**
- Include bug report details as described above
- We'll prioritize critical issues

---

## Document Version

**Version**: 1.0  
**Date**: 2026-05-03  
**For**: Private Beta Testers  

---

*This document is confidential and intended only for DecisionOS private testers.*
