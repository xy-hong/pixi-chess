import { Move } from "chess.js";
import PieceSprite from "../../entity/PieceSprite";

export interface EvPieceSelected {
    piece: PieceSprite;
    moveablePos: Move[];
}