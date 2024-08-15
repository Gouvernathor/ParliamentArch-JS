"use strict";

// similar to the python sum builtin
export function sum(ar, start = 0) {
    return ar.reduce((a, b) => a + b, start);
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
