import { Square } from 'chess.js';

// for example:  x,y to 'a5' 
function toSquare(i: number, j: number): Square {
    const a = String.fromCharCode(j + 97)
    const b = 8 - i
    const square = a + b
    return  square as Square
  }
  
function toIndex(square: Square): {i: number, j: number} {
    const j = square.charCodeAt(0) - 97;
    const i = 8 - Number(square.charAt(1))
    return {i, j}
}

export { toIndex, toSquare }