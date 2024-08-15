"use strict";

/**
 * See the Python Parliamentarch module for documentation.
 * https://github.com/Gouvernathor/parliamentarch
 */

import { sorted, sum } from "parliamentarch/_util";
import { get_seats_centers, get_row_thickness, get_nrows_from_nseats } from "parliamentarch/geometry";
import { dispatch_seats, get_grouped_svg, SeatData } from "parliamentarch/svg";

// export * as geometry from "parliamentarch/geometry";
// export * as svg from "parliamentarch/svg";
export { SeatData } from "parliamentarch/svg";

export function get_svg_from_attribution(
    attrib: Map<SeatData, number>,
    seat_radius_factor: number = .8,
    get_seats_centers_args: Array<any> = [],
    get_grouped_svg_args: Array<any> = [],
): Element {

    const nseats = sum(attrib.values());

    const results = get_seats_centers(nseats, ...get_seats_centers_args);
    // const sorted_coordinates = [...results.entries()].sort((a, b) => a[1] - b[1]).reverse().map(([k, v]) => k);
    const seat_centers_by_group = dispatch_seats(attrib, sorted(results.keys(), (a) => results.get(a), true));
    const seat_actual_radius = seat_radius_factor * get_row_thickness(get_nrows_from_nseats(nseats));
    return get_grouped_svg(seat_centers_by_group, seat_actual_radius, ...get_grouped_svg_args);
}
