"use strict";

import { sum, cached } from "./parliamentarch/_util.js";

const _DEFAULT_SPAN_ANGLE = 180;

/**
 * @param {Number} nrows
 * @return {Number}
 */
export function get_row_thickness(nrows) {
    return (1.0 / (4 * nrows - 2));
}

/**
 * @param {Number} nrows
 * @param {Number} span_angle
 * @return {Array<Number>}
 */
export function get_rows_from_nrows(nrows, span_angle = _DEFAULT_SPAN_ANGLE) {
    const rv = [];

    const rad = get_row_thickness(nrows);

    const radian_span_angle = span_angle * Math.PI / 180;

    for (let r = 0; r < nrows; r++) {
        let row_arc_radius = .5 + 2 * r * rad;
        rv.push(Math.trunc(radian_span_angle * row_arc_radius / (2 * rad)));
    }
    return rv
}

const _cached_get_rows_from_nrows = cached(get_rows_from_nrows);

/**
 * @param {Number} nseats
 * @param {Number} span_angle
 * @return {Number}
 */
export function get_nrows_from_nseats(nseats, span_angle = _DEFAULT_SPAN_ANGLE) {
    let i = 1;
    while (sum(_cached_get_rows_from_nrows(i, span_angle)) < nseats)
        i++;
    return i;
}

const _cached_get_nrows_from_nseats = cached(get_nrows_from_nseats);

export const fillingStrategy = {
    DEFAULT: "default",
    EMPTY_INNER: "empty_inner",
    OUTER_PRIORITY: "outer_priority",
}
Object.freeze(fillingStrategy);

/**
 * @param {Number} nseats
 * @param {Number} min_nrows
 * @param {String} filling_strategy
 * @param {Number} span_angle
 * @return {Map<Array<Number>, Number>}
 */
export function get_seats_centers(nseats, min_nrows = 0, filling_strategy = fillingStrategy.DEFAULT, span_angle = _DEFAULT_SPAN_ANGLE) {
    const nrows = Math.max(min_nrows, _cached_get_nrows_from_nseats(nseats, span_angle));
    const row_thicc = get_row_thickness(nrows);
    const span_angle_margin = (1 - span_angle / 180) * Math.PI / 2;

    const maxed_rows = _cached_get_rows_from_nrows(nrows, span_angle);

    let starting_row, filling_ratio, seats_on_starting_row;
    switch (filling_strategy) {
        case fillingStrategy.DEFAULT:
            starting_row = 0;
            filling_ratio = nseats / sum(maxed_rows);
            break;

        case fillingStrategy.EMPTY_INNER:
            {
                const rows = maxed_rows.slice();
                while (sum(rows.slice(1)) >= nseats)
                    rows.shift();

                starting_row = nrows - rows.length;
                filling_ratio = nseats / sum(rows);
            }
            break;

        case fillingStrategy.OUTER_PRIORITY:
            {
                const rows = maxed_rows.slice();
                while (sum(rows) > nseats)
                    rows.shift();

                starting_row = nrows - rows.length - 1;
                seats_on_starting_row = nseats - sum(rows);
            }
            break;

        default:
            throw new Error("Invalid filling strategy");
    }

    const positions = new Map();
    for (let r = starting_row; r < nrows; r++) {
        let nseats_this_row;
        if (r === nrows - 1) {
            nseats_this_row = nseats - positions.size;
        } else if (filling_strategy === fillingStrategy.OUTER_PRIORITY) {
            if (r === starting_row) {
                nseats_this_row = seats_on_starting_row;
            } else {
                nseats_this_row = maxed_rows[r];
            }
        } else {
            nseats_this_row = Math.round(maxed_rows[r] * filling_ratio);
            // nseats_this_row = Math.round((nseats - positions.size) * maxed_rows[r] / sum(maxed_rows.slice(r)));
        }

        const row_arc_radius = .5 + 2 * r * row_thicc;

        const angle_margin = Math.asin(row_thicc / row_arc_radius) + span_angle_margin;

        const angle_increment = (Math.PI - 2 * angle_margin) / (nseats_this_row - 1);

        if (nseats_this_row === 1) {
            positions.set([1., row_arc_radius], Math.PI / 2);
        } else {
            for (let s = 0; s < nseats_this_row; s++) {
                const angle = angle_margin + s * angle_increment;
                positions.set([row_arc_radius * Math.cos(angle) + 1., row_arc_radius * Math.sin(angle)], angle);
            }
        }
    }
    return positions;
}
