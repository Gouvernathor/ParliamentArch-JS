"use strict";

// similar to the python sum builtin
export function sum(ar: Iterable<number>, start = 0): number {
    return (Array.isArray(ar) ? ar : [...ar])
        .reduce((a, b) => a + b, start);
}

// similar to functools.cache in python
export function cached(f) {
    const cache = new Map();
    return function (...args) {
        const key = JSON.stringify(args);
        if (!cache.has(key)) {
            cache.set(key, f(...args));
        }
        return cache.get(key);
    }
}

// similar to the python sorted builtin
export function sorted<T>(array: Iterable<T>, key = null, reverse = false): T[] {
    return [...array].sort((a, b) => {
        if (key) {
            a = key(a);
            b = key(b);
        }
        let rv = 0;
        if (a < b) {
            rv = -1;
        } else if (a > b) {
            rv = 1;
        }
        if (reverse) {
            rv *= -1;
        }
        return rv;
    });
}
