# Flashcards Learning System — Product & Technical Specification

> ملف مرجعي واحد لبناء التطبيق باستخدام Spec Kit. هذا المستند هو مصدر الحقيقة للـMVP، تصميم قاعدة البيانات، قواعد العمل، خوارزمية المراجعة، الإحصائيات، والـAcceptance Criteria.

## 1. Product Summary

تطبيق ويب شخصي يساعد المستخدم على حفظ ومراجعة:

- معلومات تقنية وعامة.
- كلمات ومفردات.
- جمل وتعبيرات.
- أسئلة وإجابات.

يعتمد التطبيق على Flashcards مع Active Recall وSpaced Repetition. المستخدم ينشئ Decks، يضيف Cards، يبدأ جلسة مراجعة، يكشف الإجابة، ثم يقيّم مدى تذكره. النظام يحدد موعد المراجعة التالية ويعرض إحصائيات توضح مستوى التذكر والتقدم الحقيقي.

## 2. MVP Goals

1. إنشاء وإدارة مجموعات البطاقات Decks.
2. إنشاء وتعديل وحذف Flashcards.
3. دعم بطاقات سؤال/إجابة وبطاقات لغة.
4. تنفيذ جلسة مراجعة يومية للكروت المستحقة.
5. تقييم الإجابة بأربع درجات: Again، Hard، Good، Easy.
6. جدولة المراجعة التالية تلقائيًا.
7. عرض Dashboard بإحصائيات يومية وعامة.
8. الاحتفاظ بتاريخ كل محاولة مراجعة.
9. دعم العربية والإنجليزية واتجاه RTL/LTR.

## 3. Out of Scope for MVP

- مشاركة Decks بين المستخدمين.
- Marketplace عام.
- التعاون اللحظي.
- تطبيق موبايل Native.
- توليد البطاقات بالذكاء الاصطناعي.
- الصوت والنطق التلقائي.
- استيراد Anki.
- Gamification متقدمة مثل Leaderboards.

يمكن إضافتها لاحقًا بدون تغيير جوهري في الموديل الأساسي.

## 4. Suggested Stack

- Frontend: Next.js App Router + TypeScript.
- UI: Tailwind CSS + shadcn/ui.
- Forms: React Hook Form + Zod.
- Database: PostgreSQL.
- ORM: Prisma أو Drizzle؛ اختر أداة واحدة فقط طوال المشروع.
- Authentication: Auth.js أو Clerk.
- Charts: Recharts.
- Tests: Vitest + React Testing Library، وPlaywright للـcritical flows.

## 5. Core Domain Terms

| المصطلح | المعنى |
|---|---|
| Deck | مجموعة بطاقات مرتبطة بموضوع واحد. |
| Card | وحدة التعلّم: Front prompt وBack answer. |
| Card State | حالة تعلم البطاقة: NEW، LEARNING، REVIEW، RELEARNING، SUSPENDED. |
| Review | محاولة واحدة لتذكر بطاقة وتقييم الإجابة. |
| Study Session | جلسة تحتوي على مجموعة مراجعات متتالية. |
| Due Card | بطاقة حان موعد مراجعتها. |
| Rating | تقييم المستخدم: AGAIN، HARD، GOOD، EASY. |
| Retention | نسبة المراجعات الناجحة من إجمالي المراجعات. |
| Streak | عدد الأيام المتتالية التي حقق فيها المستخدم الحد الأدنى اليومي. |

## 6. Roles and Ownership

الـMVP لديه Role واحد فقط: `USER`.

- كل Deck مملوك لمستخدم واحد.
- كل Card تتبع Deck واحدًا فقط.
- المستخدم لا يستطيع قراءة أو تعديل أو حذف بيانات مستخدم آخر.
- جميع Queries وMutations يجب أن تتحقق من `user_id` في السيرفر، وليس في الواجهة فقط.

## 7. ERD

```mermaid
erDiagram
    USERS ||--o{ DECKS : owns
    USERS ||--o{ STUDY_SESSIONS : starts
    DECKS ||--o{ CARDS : contains
    DECKS ||--o{ STUDY_SESSIONS : scopes
    CARDS ||--|| CARD_SCHEDULING : has
    CARDS ||--o{ CARD_TAGS : tagged
    TAGS ||--o{ CARD_TAGS : classifies
    STUDY_SESSIONS ||--o{ REVIEWS : includes
    CARDS ||--o{ REVIEWS : receives

    USERS {
        uuid id PK
        varchar email UK
        varchar display_name
        varchar preferred_locale
        varchar timezone
        int daily_goal
        timestamp created_at
        timestamp updated_at
    }

    DECKS {
        uuid id PK
        uuid user_id FK
        varchar title
        text description
        varchar color
        varchar icon
        boolean is_archived
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    CARDS {
        uuid id PK
        uuid deck_id FK
        varchar card_type
        text front
        text back
        text hint
        text example
        varchar front_language
        varchar back_language
        boolean is_reversible
        boolean is_suspended
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    CARD_SCHEDULING {
        uuid card_id PK_FK
        varchar state
        timestamp due_at
        int interval_days
        int step_index
        decimal ease_factor
        int review_count
        int lapse_count
        int correct_streak
        timestamp last_reviewed_at
        timestamp created_at
        timestamp updated_at
    }

    STUDY_SESSIONS {
        uuid id PK
        uuid user_id FK
        uuid deck_id FK_NULLABLE
        varchar session_type
        int planned_cards
        int reviewed_cards
        int correct_cards
        timestamp started_at
        timestamp completed_at
        int duration_seconds
    }

    REVIEWS {
        uuid id PK
        uuid session_id FK
        uuid card_id FK
        varchar rating
        boolean was_correct
        int response_time_ms
        varchar previous_state
        varchar next_state
        int previous_interval_days
        int next_interval_days
        decimal previous_ease_factor
        decimal next_ease_factor
        timestamp reviewed_at
    }

    TAGS {
        uuid id PK
        uuid user_id FK
        varchar name
        varchar color
        timestamp created_at
    }

    CARD_TAGS {
        uuid card_id PK_FK
        uuid tag_id PK_FK
    }
```

## 8. Database Schema Details

### 8.1 `users`

| Field | Type | Rules |
|---|---|---|
| id | UUID | Primary key. |
| email | VARCHAR(320) | Required, unique, normalized lowercase. |
| display_name | VARCHAR(100) | Required. |
| preferred_locale | VARCHAR(10) | Default `ar-EG`. |
| timezone | VARCHAR(64) | IANA timezone; default `Africa/Cairo`. |
| daily_goal | INTEGER | Default 10; range 1–500. |
| created_at | TIMESTAMPTZ | Default now. |
| updated_at | TIMESTAMPTZ | Updated automatically. |

### 8.2 `decks`

| Field | Type | Rules |
|---|---|---|
| id | UUID | Primary key. |
| user_id | UUID | Required FK → users.id; cascade delete. |
| title | VARCHAR(120) | Required after trimming. |
| description | TEXT | Optional, maximum 1000 characters. |
| color | VARCHAR(20) | Optional theme token or valid hex. |
| icon | VARCHAR(50) | Optional approved icon key. |
| is_archived | BOOLEAN | Default false. |
| created_at | TIMESTAMPTZ | Default now. |
| updated_at | TIMESTAMPTZ | Updated automatically. |
| deleted_at | TIMESTAMPTZ | Nullable soft delete. |

Indexes:

- `(user_id, is_archived)`.
- `(user_id, updated_at DESC)`.
- Partial index on active records where `deleted_at IS NULL`.

### 8.3 `cards`

| Field | Type | Rules |
|---|---|---|
| id | UUID | Primary key. |
| deck_id | UUID | Required FK → decks.id; cascade delete. |
| card_type | ENUM | `BASIC`, `LANGUAGE`; default `BASIC`. |
| front | TEXT | Required; 1–5000 characters. |
| back | TEXT | Required; 1–10000 characters. |
| hint | TEXT | Optional; maximum 2000 characters. |
| example | TEXT | Optional; maximum 5000 characters. |
| front_language | VARCHAR(10) | Optional BCP 47 code such as `en` or `ar`. |
| back_language | VARCHAR(10) | Optional. |
| is_reversible | BOOLEAN | Default false; useful for vocabulary. |
| is_suspended | BOOLEAN | Default false. Suspended cards never enter review queues. |
| created_at | TIMESTAMPTZ | Default now. |
| updated_at | TIMESTAMPTZ | Updated automatically. |
| deleted_at | TIMESTAMPTZ | Nullable soft delete. |

Indexes:

- `(deck_id, created_at DESC)`.
- Partial index on `(deck_id)` where `deleted_at IS NULL AND is_suspended = false`.
- Optional PostgreSQL full-text index for search after MVP.

Card creation transaction:

1. Insert `cards` row.
2. Insert matching `card_scheduling` row with state `NEW`, interval `0`, due immediately.
3. If either insert fails, rollback both.

### 8.4 `card_scheduling`

One-to-one with Card. This table stores current scheduling state only; immutable history lives in `reviews`.

| Field | Type | Default / Rules |
|---|---|---|
| card_id | UUID | PK and FK → cards.id; cascade delete. |
| state | ENUM | `NEW`, `LEARNING`, `REVIEW`, `RELEARNING`, `SUSPENDED`. |
| due_at | TIMESTAMPTZ | Required. |
| interval_days | INTEGER | Default 0; never negative. |
| step_index | INTEGER | Default 0; learning/relearning step. |
| ease_factor | DECIMAL(4,2) | Default 2.50; minimum 1.30. |
| review_count | INTEGER | Default 0. |
| lapse_count | INTEGER | Default 0. |
| correct_streak | INTEGER | Default 0. |
| last_reviewed_at | TIMESTAMPTZ | Nullable. |
| created_at | TIMESTAMPTZ | Default now. |
| updated_at | TIMESTAMPTZ | Updated automatically. |

Indexes:

- `(due_at, state)`.
- `(state, due_at)` for queue selection.

### 8.5 `study_sessions`

| Field | Type | Rules |
|---|---|---|
| id | UUID | Primary key. |
| user_id | UUID | Required FK → users.id. |
| deck_id | UUID | Nullable FK → decks.id; null means mixed/all-decks session. |
| session_type | ENUM | `DAILY`, `DECK`, `CUSTOM`. |
| planned_cards | INTEGER | Queue size at session start. |
| reviewed_cards | INTEGER | Default 0. |
| correct_cards | INTEGER | Default 0. |
| started_at | TIMESTAMPTZ | Default now. |
| completed_at | TIMESTAMPTZ | Nullable. |
| duration_seconds | INTEGER | Default 0. |

An abandoned session remains with `completed_at = null`. A user may resume it, but the server must revalidate that its remaining cards still exist and belong to the user.

### 8.6 `reviews`

Immutable event log. Never update a review after it is committed.

| Field | Type | Rules |
|---|---|---|
| id | UUID | Primary key. |
| session_id | UUID | Required FK → study_sessions.id. |
| card_id | UUID | Required FK → cards.id. |
| rating | ENUM | `AGAIN`, `HARD`, `GOOD`, `EASY`. |
| was_correct | BOOLEAN | false only for AGAIN; true otherwise. |
| response_time_ms | INTEGER | Nullable or non-negative. |
| previous_state | ENUM | Scheduling state before rating. |
| next_state | ENUM | State after rating. |
| previous_interval_days | INTEGER | Snapshot before rating. |
| next_interval_days | INTEGER | Snapshot after rating. |
| previous_ease_factor | DECIMAL(4,2) | Snapshot before rating. |
| next_ease_factor | DECIMAL(4,2) | Snapshot after rating. |
| reviewed_at | TIMESTAMPTZ | Default now. |

Indexes:

- `(card_id, reviewed_at DESC)`.
- `(session_id)`.
- `(reviewed_at DESC)`.

### 8.7 `tags` and `card_tags`

- Tag names are unique per user using unique constraint `(user_id, lower(name))`.
- `card_tags` uses composite primary key `(card_id, tag_id)`.
- Before linking, the server verifies Card and Tag belong to the same user.

## 9. Enum Definitions

```text
CardType       = BASIC | LANGUAGE
CardState      = NEW | LEARNING | REVIEW | RELEARNING | SUSPENDED
ReviewRating   = AGAIN | HARD | GOOD | EASY
SessionType    = DAILY | DECK | CUSTOM
```

## 10. Spaced Repetition Rules — MVP

هذه خوارزمية واضحة وبسيطة شبيهة بـSM-2. يجب عزلها في pure domain function حتى يمكن استبدالها لاحقًا بـFSRS دون تغيير بقية النظام.

### 10.1 Learning Steps

- New card starts as `NEW`, due immediately.
- Learning steps: 1 minute، 10 minutes، ثم graduation.
- Relearning step after a lapse: 10 minutes.
- Graduating interval: 1 day.
- Easy graduation interval: 4 days.
- Minimum ease factor: 1.30.

### 10.2 Rating Behavior

#### For `NEW` or `LEARNING`

| Rating | Result |
|---|---|
| AGAIN | State = LEARNING; step_index = 0; due = now + 1 minute; correct_streak = 0. |
| HARD | State = LEARNING; remain near current step; due = now + 6 minutes. |
| GOOD | Advance one step. From first step → due in 10 minutes. From final step → state REVIEW, interval 1 day. |
| EASY | Graduate immediately to REVIEW; interval 4 days; ease + 0.15. |

#### For `REVIEW`

| Rating | Result |
|---|---|
| AGAIN | State = RELEARNING; lapse_count + 1; interval = max(1, round(old interval × 0.2)); ease − 0.20; due in 10 minutes; streak = 0. |
| HARD | Remain REVIEW; interval = max(old + 1, round(old × 1.2)); ease − 0.15. |
| GOOD | Remain REVIEW; interval = max(old + 1, round(old × ease_factor)). |
| EASY | Remain REVIEW; interval = max(old + 1, round(old × ease_factor × 1.3)); ease + 0.15. |

#### For `RELEARNING`

| Rating | Result |
|---|---|
| AGAIN | Remain RELEARNING; due in 10 minutes; streak = 0. |
| HARD | Remain RELEARNING; due in 15 minutes. |
| GOOD | Return to REVIEW using the reduced interval saved after the lapse. |
| EASY | Return to REVIEW; interval = max(2, reduced interval × 2). |

### 10.3 Shared Scheduling Rules

- Clamp `ease_factor` to minimum 1.30.
- `review_count` increases after every submitted rating.
- `correct_streak` increases for HARD/GOOD/EASY and resets on AGAIN.
- `last_reviewed_at = now` after every review.
- Day intervals are calculated using the user's timezone and stored as UTC timestamps.
- The review insert and scheduling update must happen in one database transaction.
- A duplicate submission must not produce two reviews. Use an idempotency key per displayed card attempt.

Suggested domain API:

```ts
type ScheduleInput = {
  now: Date;
  rating: "AGAIN" | "HARD" | "GOOD" | "EASY";
  state: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
  stepIndex: number;
  intervalDays: number;
  easeFactor: number;
  lapseCount: number;
  correctStreak: number;
};

type ScheduleResult = {
  nextState: "LEARNING" | "REVIEW" | "RELEARNING";
  dueAt: Date;
  intervalDays: number;
  stepIndex: number;
  easeFactor: number;
  lapseCount: number;
  correctStreak: number;
};
```

## 11. Review Queue Rules

Default daily queue order:

1. Overdue REVIEW and RELEARNING cards; oldest `due_at` first.
2. LEARNING cards due now.
3. NEW cards; oldest created first.

Constraints:

- Exclude soft-deleted, suspended, and archived-deck cards.
- Filter by the authenticated user's ownership.
- Deck session filters to one deck.
- Daily session may mix all active decks.
- Default new-card limit: 20/day.
- Default review limit: 200/day.
- If a card becomes due again during the current session, it may re-enter the queue.
- Do not reveal rating controls until the user reveals the answer.
- Queue counts shown before starting: New، Learning، Review.

## 12. Primary User Flows

### 12.1 Create a Deck

1. User clicks `New deck`.
2. Enters title and optional description/color/icon.
3. Client and server validate input.
4. Server creates Deck owned by current user.
5. UI redirects to the deck details screen and shows an empty-state prompt to add the first card.

### 12.2 Add a Card

1. User selects Basic or Language card.
2. Enters Front and Back; Hint/Example are optional.
3. For a language card, selects language directions and optional reversible mode.
4. Server creates Card and CardScheduling atomically.
5. Card appears in the deck card list.

### 12.3 Study a Deck

1. User opens a Deck and sees due counts.
2. Clicks `Study now`.
3. Server creates StudySession and returns the first valid card.
4. Front is displayed; timer starts.
5. User clicks `Show answer` or presses Space.
6. Back, optional example, and rating buttons appear.
7. User rates Again/Hard/Good/Easy using buttons or keys 1–4.
8. Server atomically inserts Review, updates CardScheduling, and session counters.
9. Next card appears until queue is empty.
10. Completion summary shows reviewed count، accuracy، duration، and cards scheduled for later.

### 12.4 Dashboard

The first viewport must show:

- `Study now` primary action.
- Due today count.
- Current streak.
- Retention for last 30 days.
- Reviews completed today vs daily goal.
- Active deck list with per-deck due count and mastery/retention indicator.

## 13. Required Screens / Routes

| Route | Purpose |
|---|---|
| `/` | Dashboard and quick study entry. |
| `/decks` | List, search, archive, and create decks. |
| `/decks/[deckId]` | Deck summary and card management. |
| `/decks/[deckId]/cards/new` | Create card. |
| `/decks/[deckId]/cards/[cardId]/edit` | Edit card. |
| `/study` | Daily mixed review session. |
| `/study/[deckId]` | Deck-specific study session. |
| `/statistics` | Learning analytics. |
| `/settings` | Daily goal, timezone, locale, and review limits. |

Mobile navigation can use a bottom bar. Desktop can use a compact sidebar. The Study screen should remove distracting navigation while a session is active.

## 14. Dashboard and Statistics Definitions

All date buckets use the user's timezone.

| Metric | Exact definition |
|---|---|
| Due Today | Active cards with `due_at` before the next local midnight. |
| Reviewed Today | Count of reviews submitted today. |
| Unique Cards Today | Count of distinct card IDs reviewed today. |
| Accuracy | Reviews with rating other than AGAIN ÷ all reviews × 100. |
| Retention 7/30 days | Same success ratio over the chosen period, excluding NEW-card first exposures if desired; choose and document one method. For MVP include all reviews. |
| Average Response Time | Average `response_time_ms` for completed reviews where value is not null. |
| New Cards Learned | Cards whose state first changed from NEW/LEARNING to REVIEW. |
| Lapses | Count of REVIEW → RELEARNING transitions. |
| Current Streak | Consecutive local calendar days ending today or yesterday where unique reviewed cards ≥ daily goal. |
| Longest Streak | Maximum historical run of qualifying days. |
| Mastered Card | Card in REVIEW with interval ≥ 21 days. |
| Deck Progress | Mastered active cards ÷ all active cards × 100. |

Statistics screen:

- KPI cards: reviewed today، retention 30d، current streak، mastered cards.
- Reviews chart for the last 30 days.
- Rating distribution: Again/Hard/Good/Easy.
- State distribution: New/Learning/Review/Relearning.
- Per-deck table: cards، due، retention، mastered percentage، last studied.
- Heatmap is post-MVP unless cheap to implement.

Do not store calculated dashboard metrics as mutable counters unless proven necessary. Calculate from Reviews and Scheduling first; introduce aggregation tables only after measuring performance.

## 15. API / Server Actions Contract

Exact transport can be Route Handlers or Server Actions, but mutations and authorization must run on the server.

### Decks

```text
GET    /api/decks
POST   /api/decks
GET    /api/decks/:deckId
PATCH  /api/decks/:deckId
DELETE /api/decks/:deckId
POST   /api/decks/:deckId/archive
```

### Cards

```text
GET    /api/decks/:deckId/cards?query=&state=&tag=&page=
POST   /api/decks/:deckId/cards
GET    /api/cards/:cardId
PATCH  /api/cards/:cardId
DELETE /api/cards/:cardId
POST   /api/cards/:cardId/suspend
POST   /api/cards/:cardId/unsuspend
```

### Study

```text
POST /api/study/sessions
GET  /api/study/sessions/:sessionId/next
POST /api/study/sessions/:sessionId/reviews
POST /api/study/sessions/:sessionId/complete
```

Create session request:

```json
{
  "sessionType": "DAILY",
  "deckId": null,
  "newLimit": 20,
  "reviewLimit": 200
}
```

Submit review request:

```json
{
  "cardId": "uuid",
  "rating": "GOOD",
  "responseTimeMs": 8200,
  "attemptId": "client-generated-uuid"
}
```

Submit review response:

```json
{
  "reviewId": "uuid",
  "schedule": {
    "state": "REVIEW",
    "dueAt": "2026-09-04T06:00:00.000Z",
    "intervalDays": 1,
    "easeFactor": 2.5
  },
  "session": {
    "reviewedCards": 4,
    "correctCards": 3,
    "remainingNow": 8
  }
}
```

### Statistics

```text
GET /api/statistics/overview?range=30d
GET /api/statistics/activity?from=&to=
GET /api/statistics/decks?range=30d
```

## 16. Validation Rules

- Trim all user text fields.
- Empty Front or Back is rejected.
- Never accept `user_id` from the client for owned resources.
- Deck title: 1–120 chars.
- Front: 1–5000 chars.
- Back: 1–10000 chars.
- Daily goal: 1–500.
- New limit: 0–200.
- Review limit: 1–1000.
- `response_time_ms`: 0–3,600,000.
- IDs must be valid UUIDs.
- Invalid enum values return validation errors.
- Sanitize rendered rich text. For MVP, plain text or safe Markdown is preferred.

## 17. Authorization and Security

- Every resource query is scoped by authenticated `user_id`.
- Never trust a Deck ID alone when reading Cards; verify Deck ownership.
- Protect mutations against CSRF according to the chosen auth/session model.
- Use secure, HttpOnly, SameSite cookies for session auth.
- Rate-limit card creation and review submission endpoints.
- Use idempotency for review submissions.
- Do not render unsanitized HTML from card content.
- Avoid logging card content or authentication data unnecessarily.
- Soft-deleted records are excluded by default.
- Database errors must not reveal internal schema details to the client.

## 18. UX and Accessibility Requirements

- Arabic and English interface support from the foundation.
- Set `dir="rtl"` for Arabic UI and `dir="ltr"` for English UI/card sides independently when needed.
- Main body text minimum 16px; controls must remain usable at 200% zoom.
- Full keyboard study flow:
  - Space: reveal answer.
  - 1: Again.
  - 2: Hard.
  - 3: Good.
  - 4: Easy.
- Keyboard shortcuts only work when focus is not inside an input or textarea.
- Focus moves predictably after revealing and submitting.
- Buttons have accessible names and visible focus styles.
- Do not use color alone to communicate ratings.
- Respect `prefers-reduced-motion` for card flip and transitions.
- Card flip animation should be short and must not block reading.
- Mobile touch targets minimum 44×44px.
- Destructive actions require confirmation.
- Empty, loading, success, and error states are required.

## 19. Suggested Visual Direction

Working-product interface, not a marketing landing page.

- Dark navy/ink background with electric lime or cyan accent.
- Large centered flashcard as the visual focus during Study.
- Compact dashboard with strong numeric hierarchy.
- Rounded surfaces without excessive glassmorphism.
- Rating colors: Again red، Hard amber، Good cyan/green، Easy violet; always include text/icons.
- Charts should prioritize readability over decoration.
- Responsive from 360px mobile width upward.

## 20. Error and Edge Cases

- Empty deck: show Add Card action; disable Study.
- No cards due: show next due time and optional `Study ahead` action only if implemented.
- Card deleted during open session: skip safely and load next card.
- Double-click or retry on rating: idempotency prevents duplicate Review.
- Network failure after rating: preserve the card and retry; do not advance until server confirms.
- Archived deck: excluded from Daily queue; existing history remains visible.
- Suspended card: excluded from queues; history retained.
- Timezone changed: future day boundaries use the new timezone; stored timestamps remain UTC.
- User closes session early: retain incomplete session or explicitly end it without falsifying completion stats.
- A deck with all cards suspended behaves like an empty review queue.

## 21. Acceptance Criteria

### Authentication and Ownership

- Given a signed-in user, when they access the app, then they only see their own Decks, Cards, Sessions, and Statistics.
- Given a resource owned by another user, when its ID is requested, then the server returns not found or forbidden without exposing its content.

### Decks and Cards

- User can create, edit, archive, restore, and soft-delete a Deck.
- User can create, edit, suspend, unsuspend, and soft-delete a Card.
- Creating a Card always creates exactly one CardScheduling row.
- A Card cannot exist without a Deck.

### Study

- Study starts with due counts and displays one card at a time.
- Answer and ratings are hidden until Reveal is activated.
- Every accepted rating creates exactly one immutable Review.
- Every accepted rating updates scheduling using the rules in section 10.
- A failed review transaction creates neither partial Review nor partial scheduling update.
- Session completion totals match its Review records.

### Statistics

- Dashboard metrics match Review and CardScheduling records for the user's timezone.
- Date-range filters update all related statistics consistently.
- Deck statistics exclude soft-deleted cards from current totals but preserve historical Reviews.

### Accessibility and Responsive Behavior

- The complete Study flow works by keyboard.
- The interface is usable at 360px width and 200% browser zoom.
- Arabic content displays RTL correctly and English content displays LTR correctly.
- Motion reduction preference disables non-essential card animation.

## 22. Testing Strategy

### Unit Tests

- Scheduling function for every state × rating combination.
- Minimum ease clamp.
- Interval rounding and minimum interval rules.
- Streak and retention calculation across timezone boundaries.
- Validation schemas.

### Integration Tests

- Card + CardScheduling atomic creation.
- Review + schedule + session counters atomic update.
- Ownership checks for every server mutation.
- Duplicate `attemptId` produces one Review only.
- Queue excludes archived, suspended, deleted, and not-due cards.

### End-to-End Tests

1. Sign in → create Deck → add Card → study → rate Good → see updated statistics.
2. Keyboard-only review flow.
3. Mobile viewport create-and-study flow.
4. Network retry does not duplicate a Review.
5. Arabic card and English card render with correct directions.

## 23. Recommended Implementation Phases

### Phase 1 — Foundation

- App shell, authentication, database, migrations, ownership middleware/helpers.
- Deck and Card CRUD.

### Phase 2 — Learning Engine

- Pure scheduling function and exhaustive unit tests.
- Queue query, StudySession, Review transaction, keyboard controls.

### Phase 3 — Insights

- Dashboard metrics and statistics queries.
- Charts, streak, retention, and deck progress.

### Phase 4 — Quality

- Responsive polish, RTL/LTR, accessibility, error states, Playwright tests.
- Performance checks and deployment configuration.

## 24. Future-Compatible Extensions

- FSRS scheduler with user-specific desired retention.
- AI card generation from text/PDF/URL.
- Audio, pronunciation, and speech scoring.
- Cloze deletion cards.
- Image-based cards.
- CSV/Anki import and export.
- Shared/public Decks and collaboration.
- Offline-first PWA and sync.
- Daily reminders and browser notifications.
- Exam mode with typed answers and confidence calibration.

Do not implement these in the MVP unless explicitly requested.

## 25. Instructions for Codex + Spec Kit

Use this file as the authoritative product specification.

1. Generate constitution/principles emphasizing data ownership, transactional consistency, accessibility, and testable domain logic.
2. Generate the feature specification from sections 1–21.
3. Generate the implementation plan following the phases in section 23.
4. Keep the spaced-repetition algorithm in a framework-independent module with exhaustive unit tests.
5. Do not add out-of-scope features or alter scheduling rules silently.
6. When a technical choice is unspecified, select the simplest option compatible with the suggested stack and record the choice in the plan.
7. Treat all statistics definitions and Acceptance Criteria as testable requirements.
8. Create migrations and seed data containing at least three Decks: Frontend، English Vocabulary، General Knowledge.
9. Before marking the task complete, run type checking, tests, production build, and the listed E2E critical flow.

## 26. Definition of Done

The MVP is complete only when:

- A user can create a Deck and Cards.
- The user can complete a review session with all four ratings.
- Scheduling produces deterministic, tested next-review dates.
- History and statistics update correctly.
- Ownership is enforced server-side.
- Core flows work on mobile and desktop with keyboard accessibility.
- The database migration, seed, unit tests, integration tests, E2E critical flow, and production build all pass.

