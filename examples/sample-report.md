---
siteproof_schema: "0.1.0"
audit_id: "a3bb6434-9688-4d6a-8ff9-f21cbdeb176a"
url: "https://taneverse.com/"
audited_at: "2026-07-25T08:16:50.566Z"
verdict: "still-needs-work"
blocker: 0
major: 1
minor: 0
---

# SiteProof Audit Report

| | |
| --- | --- |
| URL | [https://taneverse.com/](https://taneverse.com/) |
| Generated | 2026-07-25T08:16:50.566Z |
| Verdict | **Still needs work** |
| Primary user task | A first-time visitor can understand what Taneverse offers, review representative work, and find a way to get in touch. |

## Executive summary

| Blocker | Major | Minor | Observation | Total evidence |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 1 | 0 | 2 | 3 |

## Audited viewports

| Viewport | Size |
| --- | ---: |
| Desktop | 1440 × 900 |
| Tablet | 768 × 1024 |
| Mobile | 390 × 844 |

> Screenshots are stored in the local SiteProof report. They are not embedded as base64 data in this Markdown file.

## Verified findings

### SP-001 · Low text contrast

- **Severity:** major
- **Category:** accessibility
- **Rule:** `A11Y_CONTRAST`
- **Viewports:** desktop, tablet, mobile
- **Element:** `section.section:nth-of-type(1) > div.works:nth-of-type(2) > a.work:nth-of-type(1) > div > p`
- **Message:** 5 text elements share an estimated contrast of 3.12:1, below the 4.5:1 threshold.

**Evidence**

```json
{
  "background": "rgb(244, 243, 239)",
  "color": "rgb(138, 138, 133)",
  "count": 5,
  "instances": [
    {
      "element": "section.section:nth-of-type(1) > div.works:nth-of-type(2) > a.work:nth-of-type(1) > div > p",
      "sample": "從設計到出版流程，整套用 AI 建起來。內容源是 MD 檔，發文＝加一個檔案。"
    },
    {
      "element": "section.section:nth-of-type(1) > div.works:nth-of-type(2) > a.work:nth-of-type(2) > div > p",
      "sample": "客人問「今天有開嗎」，機器人查即時營業時間直接回。24 小時不下班。"
    },
    {
      "element": "section.section:nth-of-type(1) > div.works:nth-of-type(2) > a.work:nth-of-type(3) > div > p",
      "sample": "一份設計規格檔，讓 AI 每次都產出同一種安靜的版面。"
    },
    {
      "element": "main.site-main > section.section:nth-of-type(3) > a.service-card > div > p",
      "sample": "目前開放：LINE 自動回覆機器人。你去忙的時候，讓機器人替你回訊息。"
    },
    {
      "element": "html > body > footer.site-footer > p.mini",
      "sample": "© taneverse"
    }
  ],
  "ratio": 3.12,
  "threshold": 4.5,
  "truncated": false
}
```

### SP-002 · Touch targets are below the comfort recommendation

- **Severity:** observation
- **Category:** responsive
- **Rule:** `TOUCH_TARGET_COMFORT`
- **Viewports:** tablet
- **Element:** `html > body > nav.site-nav > a.brand`
- **Message:** 8 interactive targets are below 44 × 44 CSS px. Treat this as a mobile comfort review, not an automatic launch failure.

**Evidence**

```json
{
  "count": 8,
  "instances": [
    {
      "element": "html > body > nav.site-nav > a.brand",
      "height": 31,
      "label": "taneverse",
      "width": 75
    },
    {
      "element": "html > body > nav.site-nav > div.links > a:nth-of-type(1)",
      "height": 26,
      "label": "WORKS",
      "width": 65
    },
    {
      "element": "html > body > nav.site-nav > div.links > a:nth-of-type(2)",
      "height": 26,
      "label": "BLOG",
      "width": 49
    },
    {
      "element": "html > body > nav.site-nav > div.links > a:nth-of-type(3)",
      "height": 26,
      "label": "SERVICES",
      "width": 88
    },
    {
      "element": "html > body > nav.site-nav > div.links > a:nth-of-type(4)",
      "height": 26,
      "label": "ABOUT",
      "width": 61
    },
    {
      "element": "html > body > main.site-main > section.section:nth-of-type(2) > a.more-link",
      "height": 32,
      "label": "ALL POSTS →",
      "width": 126
    },
    {
      "element": "html > body > footer.site-footer > div.doors > a:nth-of-type(1)",
      "height": 31,
      "label": "INSTAGRAM",
      "width": 109
    },
    {
      "element": "html > body > footer.site-footer > div.doors > a:nth-of-type(2)",
      "height": 31,
      "label": "COMMUNITY",
      "width": 115
    }
  ],
  "recommendation": "44 × 44 CSS px touch comfort",
  "truncated": false
}
```

### SP-003 · Touch targets are below the comfort recommendation

- **Severity:** observation
- **Category:** responsive
- **Rule:** `TOUCH_TARGET_COMFORT`
- **Viewports:** mobile
- **Element:** `html > body > nav.site-nav > a.brand`
- **Message:** 8 interactive targets are below 44 × 44 CSS px. Treat this as a mobile comfort review, not an automatic launch failure.

**Evidence**

```json
{
  "count": 8,
  "instances": [
    {
      "element": "html > body > nav.site-nav > a.brand",
      "height": 31,
      "label": "taneverse",
      "width": 75
    },
    {
      "element": "html > body > nav.site-nav > div.links > a:nth-of-type(1)",
      "height": 22,
      "label": "WORKS",
      "width": 52
    },
    {
      "element": "html > body > nav.site-nav > div.links > a:nth-of-type(2)",
      "height": 22,
      "label": "BLOG",
      "width": 39
    },
    {
      "element": "html > body > nav.site-nav > div.links > a:nth-of-type(3)",
      "height": 22,
      "label": "SERVICES",
      "width": 70
    },
    {
      "element": "html > body > nav.site-nav > div.links > a:nth-of-type(4)",
      "height": 22,
      "label": "ABOUT",
      "width": 49
    },
    {
      "element": "html > body > main.site-main > section.section:nth-of-type(2) > a.more-link",
      "height": 32,
      "label": "ALL POSTS →",
      "width": 126
    },
    {
      "element": "html > body > footer.site-footer > div.doors > a:nth-of-type(1)",
      "height": 31,
      "label": "INSTAGRAM",
      "width": 109
    },
    {
      "element": "html > body > footer.site-footer > div.doors > a:nth-of-type(2)",
      "height": 31,
      "label": "COMMUNITY",
      "width": 115
    }
  ],
  "recommendation": "44 × 44 CSS px touch comfort",
  "truncated": false
}
```

## UX heuristic review

> These are potential risks organized by Jakob Nielsen’s usability heuristics. They are not an NN/g certification or a substitute for usability testing.
>
> Source: https://www.nngroup.com/articles/ten-usability-heuristics/

### H1 · Visibility of system status

- **Status:** needs-human-review
- **Review question:** After an important action, can people immediately tell whether the system is working, succeeded, or failed?
- **Related evidence:** —

### H2 · Match between system and the real world

- **Status:** needs-human-review
- **Review question:** Do the words, order, and concepts match the target audience instead of internal terminology?
- **Related evidence:** —

### H3 · User control and freedom

- **Status:** needs-human-review
- **Review question:** Can people cancel, go back, or correct an action without starting over?
- **Related evidence:** —

### H4 · Consistency and standards

- **Status:** needs-human-review
- **Review question:** Do equivalent actions use consistent names, appearances, and locations?
- **Related evidence:** —

### H5 · Error prevention

- **Status:** needs-human-review
- **Review question:** Does the interface use constraints, confirmation, or clear guidance before risky actions?
- **Related evidence:** —

### H6 · Recognition rather than recall

- **Status:** needs-human-review
- **Review question:** Are the information and choices required for the primary task kept visible?
- **Related evidence:** —

### H7 · Flexibility and efficiency of use

- **Status:** potential-risk
- **Review question:** Can a first-time visitor understand the interface while experienced users remain efficient?
- **Related evidence:** SP-002, SP-003

### H8 · Aesthetic and minimalist design

- **Status:** potential-risk
- **Review question:** Does secondary information compete with the primary task, message, or action?
- **Related evidence:** SP-001

### H9 · Recognize, diagnose, and recover from errors

- **Status:** needs-human-review
- **Review question:** Do error messages explain the problem, likely cause, and useful next step?
- **Related evidence:** —

### H10 · Help and documentation

- **Status:** needs-human-review
- **Review question:** Do unfamiliar or complex actions provide contextual guidance or easy-to-find help?
- **Related evidence:** —

## Limitations

- UX heuristics identify potential risks; they do not replace usability testing with real participants.
- Contrast checks are estimates based on computed foreground and ancestor background colors.
- The PoC audits one public page and does not log in, submit forms, or follow task flows.

## Codex handoff

The following repair packet is included so this report can be attached directly to a Codex task.

<details>
<summary>SiteProof repair packet</summary>

```markdown
# SiteProof repair packet

Website: https://taneverse.com/
Audited at: 2026-07-25T08:16:50.566Z
Primary user task: A first-time visitor can understand what Taneverse offers, review representative work, and find a way to get in touch.
Current verdict: still-needs-work

## Your job

Fix the verified technical and accessibility issues below without changing the site's intended visual identity.

Rules:
1. Inspect the existing codebase before editing.
2. Preserve working behavior and responsive layouts.
3. Address blocker and major findings first.
4. Do not invent brand facts or user evidence.
5. For UX heuristic questions, cite a screenshot, DOM element, interaction state, or code path.
6. If the page alone cannot prove an answer, mark it "Needs user testing".
7. After editing, recheck widths 1440, 768, and 390 CSS px.

## Verified findings

1. [MAJOR] Low text contrast
   - Rule: A11Y_CONTRAST
   - Message: 5 text elements share an estimated contrast of 3.12:1, below the 4.5:1 threshold.
   - Element: section.section:nth-of-type(1) > div.works:nth-of-type(2) > a.work:nth-of-type(1) > div > p
   - Viewports: desktop, tablet, mobile
   - Evidence: {"background":"rgb(244, 243, 239)","color":"rgb(138, 138, 133)","count":5,"instances":[{"element":"section.section:nth-of-type(1) > div.works:nth-of-type(2) > a.work:nth-of-type(1) > div > p","sample":"從設計到出版流程，整套用 AI 建起來。內容源是 MD 檔，發文＝加一個檔案。"},{"element":"section.section:nth-of-type(1) > div.works:nth-of-type(2) > a.work:nth-of-type(2) > div > p","sample":"客人問「今天有開嗎」，機器人查即時營業時間直接回。24 小時不下班。"},{"element":"section.section:nth-of-type(1) > div.works:nth-of-type(2) > a.work:nth-of-type(3) > div > p","sample":"一份設計規格檔，讓 AI 每次都產出同一種安靜的版面。"},{"element":"main.site-main > section.section:nth-of-type(3) > a.service-card > div > p","sample":"目前開放：LINE 自動回覆機器人。你去忙的時候，讓機器人替你回訊息。"},{"element":"html > body > footer.site-footer > p.mini","sample":"© taneverse"}],"ratio":3.12,"threshold":4.5,"truncated":false}

2. [OBSERVATION] Touch targets are below the comfort recommendation
   - Rule: TOUCH_TARGET_COMFORT
   - Message: 8 interactive targets are below 44 × 44 CSS px. Treat this as a mobile comfort review, not an automatic launch failure.
   - Element: html > body > nav.site-nav > a.brand
   - Viewports: tablet
   - Evidence: {"count":8,"instances":[{"element":"html > body > nav.site-nav > a.brand","height":31,"label":"taneverse","width":75},{"element":"html > body > nav.site-nav > div.links > a:nth-of-type(1)","height":26,"label":"WORKS","width":65},{"element":"html > body > nav.site-nav > div.links > a:nth-of-type(2)","height":26,"label":"BLOG","width":49},{"element":"html > body > nav.site-nav > div.links > a:nth-of-type(3)","height":26,"label":"SERVICES","width":88},{"element":"html > body > nav.site-nav > div.links > a:nth-of-type(4)","height":26,"label":"ABOUT","width":61},{"element":"html > body > main.site-main > section.section:nth-of-type(2) > a.more-link","height":32,"label":"ALL POSTS →","width":126},{"element":"html > body > footer.site-footer > div.doors > a:nth-of-type(1)","height":31,"label":"INSTAGRAM","width":109},{"element":"html > body > footer.site-footer > div.doors > a:nth-of-type(2)","height":31,"label":"COMMUNITY","width":115}],"recommendation":"44 × 44 CSS px touch comfort","truncated":false}

3. [OBSERVATION] Touch targets are below the comfort recommendation
   - Rule: TOUCH_TARGET_COMFORT
   - Message: 8 interactive targets are below 44 × 44 CSS px. Treat this as a mobile comfort review, not an automatic launch failure.
   - Element: html > body > nav.site-nav > a.brand
   - Viewports: mobile
   - Evidence: {"count":8,"instances":[{"element":"html > body > nav.site-nav > a.brand","height":31,"label":"taneverse","width":75},{"element":"html > body > nav.site-nav > div.links > a:nth-of-type(1)","height":22,"label":"WORKS","width":52},{"element":"html > body > nav.site-nav > div.links > a:nth-of-type(2)","height":22,"label":"BLOG","width":39},{"element":"html > body > nav.site-nav > div.links > a:nth-of-type(3)","height":22,"label":"SERVICES","width":70},{"element":"html > body > nav.site-nav > div.links > a:nth-of-type(4)","height":22,"label":"ABOUT","width":49},{"element":"html > body > main.site-main > section.section:nth-of-type(2) > a.more-link","height":32,"label":"ALL POSTS →","width":126},{"element":"html > body > footer.site-footer > div.doors > a:nth-of-type(1)","height":31,"label":"INSTAGRAM","width":109},{"element":"html > body > footer.site-footer > div.doors > a:nth-of-type(2)","height":31,"label":"COMMUNITY","width":115}],"recommendation":"44 × 44 CSS px touch comfort","truncated":false}

## UX heuristic review

Framework reference: https://www.nngroup.com/articles/ten-usability-heuristics/
This is an independent heuristic review, not an NN/g certification.

- H1 Visibility of system status: After an important action, can people immediately tell whether the system is working, succeeded, or failed? Status: needs-human-review
- H2 Match between system and the real world: Do the words, order, and concepts match the target audience instead of internal terminology? Status: needs-human-review
- H3 User control and freedom: Can people cancel, go back, or correct an action without starting over? Status: needs-human-review
- H4 Consistency and standards: Do equivalent actions use consistent names, appearances, and locations? Status: needs-human-review
- H5 Error prevention: Does the interface use constraints, confirmation, or clear guidance before risky actions? Status: needs-human-review
- H6 Recognition rather than recall: Are the information and choices required for the primary task kept visible? Status: needs-human-review
- H7 Flexibility and efficiency of use: Can a first-time visitor understand the interface while experienced users remain efficient? Status: potential-risk; related evidence: SP-002, SP-003
- H8 Aesthetic and minimalist design: Does secondary information compete with the primary task, message, or action? Status: potential-risk; related evidence: SP-001
- H9 Recognize, diagnose, and recover from errors: Do error messages explain the problem, likely cause, and useful next step? Status: needs-human-review
- H10 Help and documentation: Do unfamiliar or complex actions provide contextual guidance or easy-to-find help? Status: needs-human-review

## Required response

Return:
- files changed;
- verified issues fixed;
- issues intentionally left unchanged and why;
- UX questions that still require real-user testing;
- how you revalidated desktop, tablet, and mobile.
```

</details>
