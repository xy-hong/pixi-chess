import { Square } from "chess.js"
import { PieceColor } from "./types"

type GlobalState = {
    turn: PieceColor,
    lastMove: { from: Square, to: Square } | { from: null, to: null },
}

const globalState: GlobalState = {
    turn: 'w',
    lastMove: { from: null, to: null }
}

export default globalState