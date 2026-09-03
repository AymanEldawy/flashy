# Flashy

Flashy is a focused, bilingual flashcard application for active recall and spaced repetition. It supports Arabic and English card content, daily review queues, four recall ratings, and custom study sessions built from cards across multiple decks.

## Highlights

- Create personal decks and Basic or Language flashcards.
- Review with Again, Hard, Good, and Easy ratings using a deterministic SM-2-inspired scheduler.
- Navigate a study session with visible Previous/Next controls or the Left/Right arrow keys.
- Build a custom study session by selecting individual cards from different decks, including cards that are not currently due.
- Use Space to reveal an answer and keys 1–4 to rate recall.
- View progress, daily goal, retention, card states, and deck-level statistics.
- Arabic RTL and English LTR rendering, responsive layout, and reduced-motion support.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm test
npx tsc --noEmit
npm run build
```

## Persistence

The current runnable prototype stores its data in browser localStorage, allowing it to run without a backend. The intended PostgreSQL/Prisma production data model is in [`prisma/schema.prisma`](prisma/schema.prisma), ready to be connected to authenticated server-side actions.
