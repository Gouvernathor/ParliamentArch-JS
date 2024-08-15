"use strict";

import { sum } from "parliamentarch/_util";

export class SeatData {
    id: number|null;
    data: string;
    color: string;
    border_size: number;
    border_color: string;

    constructor(data: string, color: string, border_size: number = 0, border_color: string = "#000") {
        this.id = null;
        this.data = data;
        this.color = color;
        this.border_size = border_size;
        this.border_color = border_color;
    }

    get sanitized_data() {
        return this.data.replace(/[^a-zA-Z0-9_-]/g, "-");
    }
}

type S = [number, number];
export function dispatch_seats(group_seats: Map<SeatData, number>, seats: Iterable<S>): Map<SeatData, S[]> {
    const seatIterator = seats[Symbol.iterator]();
    const rv = new Map();
    for (const [group, nseats] of group_seats.entries()) {
        const group_seats: S[] = [];
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

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

type get_grouped_svg_options = {
    canvas_size?: number,
    margins?: number|number[],
    write_number_of_seats?: boolean,
    font_size_factor?: number
}
export function get_grouped_svg(
    seat_centers_by_group: Map<SeatData, [number, number][]>,
    seat_actual_radius: number,
    {
        canvas_size = 175,
        margins = 5.,
        write_number_of_seats = true,
        font_size_factor = 36 / 175
    }: get_grouped_svg_options = {}): Element {

    if (!Array.isArray(margins)) {
        margins = [margins, margins, margins, margins];
    } else if (margins.length === 2) {
        margins = [margins[0], margins[1], margins[0], margins[1]];
    }
    const [left_margin, top_margin, right_margin, bottom_margin] = margins;

    const svg = document.createElementNS(SVG_NAMESPACE, "svg");

    populate_header(svg,
        left_margin + 2 * canvas_size + right_margin,
        top_margin + canvas_size + bottom_margin);
    if (write_number_of_seats) {
        add_number_of_seats(svg,
            sum(Array.from(seat_centers_by_group.values(), group => group.length)),
            left_margin + canvas_size,
            top_margin + (canvas_size * 170 / 175),
            Math.round(font_size_factor * canvas_size));
    }
    add_grouped_seats(svg,
        seat_centers_by_group,
        seat_actual_radius,
        canvas_size,
        left_margin,
        top_margin);

    return svg
}

function populate_header(svg: Element, width: number, height: number) {
    svg.setAttribute("version", "1.1");
    svg.setAttribute("width", width.toString());
    svg.setAttribute("height", height.toString());
}

function add_number_of_seats(svg: Element, nseats: number, x: number, y: number, font_size: number) {
    const text = svg.appendChild(document.createElementNS(SVG_NAMESPACE, "text"));
    text.setAttribute("x", x.toString());
    text.setAttribute("y", y.toString());
    text.setAttribute("style", `font-size: ${font_size}px; font-weight: bold; text-align: center; text-anchor: middle; font-family: sans-serif;`);
    text.textContent = nseats.toString();
}

function add_grouped_seats(svg: Element,
    seat_centers_by_group: Map<SeatData, [number, number][]>,
    seat_actual_radius: number,
    canvas_size: number,
    left_margin: number,
    top_margin: number) {

    let group_number_fallback = 0;

    for (const [group, seat_centers] of seat_centers_by_group.entries()) {
        let group_number = group.id;
        if (group_number === null) {
            group_number = group_number_fallback;
            group_number_fallback++;
        }

        const group_border_width = group.border_size * seat_actual_radius * canvas_size;

        const group_g = svg.appendChild(document.createElementNS(SVG_NAMESPACE, "g"));

        let g_style = `fill: ${group.color};`;
        if (group_border_width > 0) {
            g_style += `stroke-width: ${group_border_width}; stroke: ${group.border_color};`;
        }
        group_g.setAttribute("style", g_style);

        group_g.setAttribute("id", `${group_number}-${group.sanitized_data}`);

        if (group.data && group.data !== "") {
            group_g.appendChild(document.createElementNS(SVG_NAMESPACE, "title")).textContent = group.data;
        }

        for (const [x, y] of seat_centers) {
            const circle = group_g.appendChild(document.createElementNS(SVG_NAMESPACE, "circle"));
            circle.setAttribute("cx", (left_margin + canvas_size * x).toString());
            circle.setAttribute("cy", (top_margin + canvas_size * (1 - y)).toString());
            circle.setAttribute("r", (seat_actual_radius * canvas_size - group_border_width / 2).toString());
        }
    }
}
