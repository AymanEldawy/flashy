# Technical Plan

The delivery uses Next.js with TypeScript. The runnable prototype persists data locally so it can run without infrastructure; `prisma/schema.prisma` defines the intended PostgreSQL replacement boundary for authenticated production mode. `lib/scheduler.ts` is framework- and storage-independent, while `lib/scheduler.test.ts` verifies its core transitions. The app's dashboard derives its figures from cards, current scheduling records, and immutable reviews.
