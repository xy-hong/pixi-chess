import { Square } from 'chess.js';

export function toIndex(square: Square): { i: number, j: number; } {
    const j = square.charCodeAt(0) - 97;
    const i = 8 - Number(square.charAt(1));
    return { i, j };
}

export function positionMapping(square: Square) {
    const { i, j } = toIndex(square);
    const y = i * 32;
    const x = j * 32;
    return { x, y };
}