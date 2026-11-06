import type { Devotee } from '../types/temple';
import { SEATS } from '../components/DevoteeCrowd';

// Seats in the hall (DevoteeCrowd SEATS); seat 0 fills first
export const SEAT_COUNT = SEATS.length;

/**
 * Seat for a newcomer: the first free seat, or, when the hall is full, the seat of the person
 * who has been quiet the longest. TikTok never reports viewers leaving, so idleness stands in for it.
 */
export function pickSeat(devotees: Devotee[]): { seat: number; evict?: Devotee } {
  const taken = new Set(devotees.map((d) => d.seat));
  for (let seat = 0; seat < SEAT_COUNT; seat++) {
    if (!taken.has(seat)) return { seat };
  }
  const lastSeen = (d: Devotee) => d.lastActive ?? d.joinedAt;
  const evict = devotees.reduce((a, b) => (lastSeen(b) < lastSeen(a) ? b : a));
  return { seat: evict.seat ?? 0, evict };
}
