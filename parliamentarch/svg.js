"use strict";

export class SeatData {
    constructor(data, color, border_size=0, border_color="#000") {
        this.data = data;
        this.color = color;
        this.border_size = border_size;
        this.border_color = border_color;
    }

    get_sanitized_data() {
        return this.data.replace(/[^a-zA-Z0-9_-]/g, "-");
    }
}

/**
 * Reimplemented using JS's specificities.
 * @param {Map<SeatData, Number>} group_seats
 * @param {Iterable<S>} seats
 * @return {Map<SeatData, S[]>}
 */
export function dispatch_seats(group_seats, seats) {
    const seatIterator = seats[Symbol.iterator]();
    const rv = new Map();
    for (const [group, nseats] of group_seats.entries()) {
        const group_seats = [];
        for (let i = 0; i < nseats; i++) {
            const seat = seatIterator.next();
            if (seat.done) {
                throw new Error("Not enough seats");
            }
            group_seats.push(seat.value);
        }
        rv.set(group, group_seats);
    }
    if (!seatIterator.next().done) {
        throw new Error("Too many seats");
    }
    return rv;
}
