export type Rating = "AGAIN" | "HARD" | "GOOD" | "EASY";
export type CardState = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
export type CardType = "BASIC" | "LANGUAGE";

export type Deck = { id: string; title: string; description?: string; color: string; icon: string; archived?: boolean; createdAt: string };
export type Card = { id: string; deckId: string; type: CardType; front: string; back: string; hint?: string; example?: string; frontLanguage?: string; backLanguage?: string; reversible?: boolean; suspended?: boolean; createdAt: string };
export type Scheduling = { cardId: string; state: CardState; dueAt: string; intervalDays: number; stepIndex: number; easeFactor: number; reviewCount: number; lapseCount: number; correctStreak: number; lastReviewedAt?: string };
export type Review = { id: string; cardId: string; deckId: string; rating: Rating; wasCorrect: boolean; responseTimeMs: number; previousState: CardState; nextState: CardState; reviewedAt: string };
export type FlashyData = { decks: Deck[]; cards: Card[]; scheduling: Scheduling[]; reviews: Review[]; dailyGoal: number; locale: "ar" | "en" };

export const initialData: FlashyData = {
  dailyGoal: 10, locale: "ar",
  decks: [
    { id: "frontend", title: "Frontend", description: "React, CSS & browser APIs", color: "cyan", icon: "⌘", createdAt: "2026-08-20T09:00:00Z" },
    { id: "english", title: "English Vocabulary", description: "Words worth keeping", color: "violet", icon: "Aa", createdAt: "2026-08-22T09:00:00Z" },
    { id: "general", title: "General Knowledge", description: "Small facts, big connections", color: "lime", icon: "✦", createdAt: "2026-08-24T09:00:00Z" }
  ],
  cards: [
    { id: "c1", deckId: "frontend", type: "BASIC", front: "What does React's useEffect synchronize?", back: "A component with an external system: the DOM, a network connection, a subscription, or a browser API.", hint: "It is not primarily for deriving state.", frontLanguage: "en", backLanguage: "en", createdAt: "2026-08-20T09:00:00Z" },
    { id: "c2", deckId: "frontend", type: "BASIC", front: "What does CSS contain do?", back: "It lets the browser isolate an element's layout, style, or paint work from the rest of the page.", frontLanguage: "en", backLanguage: "en", createdAt: "2026-08-21T09:00:00Z" },
    { id: "c3", deckId: "english", type: "LANGUAGE", front: "serendipity", back: "A fortunate discovery made by chance.", example: "Finding that tiny bookstore was pure serendipity.", frontLanguage: "en", backLanguage: "en", reversible: true, createdAt: "2026-08-22T09:00:00Z" },
    { id: "c4", deckId: "english", type: "LANGUAGE", front: "تأنّى", back: "to proceed slowly and carefully; take your time", example: "تأنَّ في اتخاذ القرار.", frontLanguage: "ar", backLanguage: "en", createdAt: "2026-08-23T09:00:00Z" },
    { id: "c5", deckId: "general", type: "BASIC", front: "What is the only planet known to rotate on its side?", back: "Uranus. Its axial tilt is about 98 degrees.", frontLanguage: "en", backLanguage: "en", createdAt: "2026-08-24T09:00:00Z" },
    { id: "c6", deckId: "general", type: "BASIC", front: "ما هي أكبر قارة في العالم؟", back: "آسيا هي أكبر القارات مساحةً وسكانًا.", frontLanguage: "ar", backLanguage: "ar", createdAt: "2026-08-25T09:00:00Z" }
  ],
  scheduling: ["c1", "c2", "c3", "c4", "c5", "c6"].map((cardId) => ({ cardId, state: "NEW" as CardState, dueAt: "2026-01-01T00:00:00Z", intervalDays: 0, stepIndex: 0, easeFactor: 2.5, reviewCount: 0, lapseCount: 0, correctStreak: 0 })),
  reviews: []
};
