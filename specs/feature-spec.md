# Feature Specification: Flashy MVP

## User journeys

- Create and manage personal decks, then add basic or language flashcards.
- Start a daily or deck-specific study session, reveal an answer, and rate recall with Again, Hard, Good, or Easy.
- See due work, streak, retention, progress, and recent activity in Arabic or English.

## Functional requirements

- Cards retain a separate current scheduling state and immutable review history.
- Queue order is overdue review/relearning, learning, then new cards.
- Scheduler behavior follows `flashcards-product-spec.md` section 10 exactly.
- Study controls work with Space and 1–4 outside text inputs.
- Arabic card text renders RTL; English text renders LTR.

## Technical choices

- Next.js App Router, TypeScript, CSS modules-free global styling, and browser localStorage for this runnable prototype.
- The domain model and scheduler are storage-independent so a Prisma/PostgreSQL adapter can replace the local repository without UI changes.
- A Prisma schema is included as the production persistence contract.
