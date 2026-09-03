# Flashy Constitution

1. **Ownership is server-first.** Every persisted resource is owned by exactly one user and every future server query must be scoped by that owner.
2. **Learning data is consistent.** A review event and the resulting scheduling mutation are one atomic operation; history is immutable.
3. **The scheduler is pure.** Spaced-repetition rules live outside UI and storage code, are deterministic for a supplied clock, and are exhaustively tested.
4. **The study flow is accessible.** Keyboard controls, Arabic RTL support, readable text, visible focus, and reduced motion are product requirements.
5. **Statistics are derived.** Metrics come from review history and scheduling state rather than mutable display counters.
6. **MVP scope stays narrow.** Decks, cards, review, and insights are shipped before collaboration, AI, imports, and gamification.
