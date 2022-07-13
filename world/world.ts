import { Chess, ChessInstance, Move, PieceType, Square } from "chess.js";
import { Application, Graphics, Spritesheet, Text } from "pixi.js";
import PieceSprite from "../entity/PieceSprite";
import globalState from "../global";
import { PieceColor } from "../types";
import { toIndex } from "../utils/mapping";

const SCALE = 1;
const PADDING = 32 * SCALE;

const BACKGROUND_ZINDEX = 0;
const SQURE_ZINDEX = 1;
const HIGHLIGHT_ZINDEX = 2;




let world: World;
export function getWorld() {
    if (!world) {
        world = new World();
    }
    return world;
}


class World {
    app: Application;
    chess: ChessInstance;
    aboardMap: Map<Square, PieceSprite>;


    constructor() {
        this.app = initApp();
        this.chess = new Chess();
        this.aboardMap = new Map();
    }

    setUp() {
        const initBoard = this.chess.board();
        this.app.loader
            .add("image/chess.json")
            .add("image/chess_active.json")
            .load(() => {
                const chessSheet = this.app.loader.resources["image/chess.json"].spritesheet;
                // const activeChessSheet = this.app.loader.resources["image/chess_active.json"].spritesheet;
                this.drawChessBoard(PADDING, SCALE);
                this.setupPiece(initBoard, chessSheet!!, PADDING);
                this.setupSquareLabel(PADDING, SCALE);
            });

        // Listen for animate update
        this.app.ticker.add((delta) => {
            // use delta to create frame-independent transform
            // container.rotation -= 0.01 * delta;
        });


    }
    private setupPiece(position, sheet: Spritesheet, padding: number, scale = 1) {
        console.log(position);
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const cell = position[i][j];
                if (cell) {
                    // load sprite
                    const sprite = createPieceSprite(sheet, cell.type, cell.color, i, j, this.chess);
                    const { x, y } = positionMapping(cell.square);
                    sprite.x = x + padding;
                    sprite.y = y + padding;

                    this.app.stage.addChild(sprite);
                    this.aboardMap.set(cell.square, sprite);
                }
            }
        }
    }
    // setup square label
    private setupSquareLabel(padding: number, scale = 1) {
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const numbers = ['1', '2', '3', '4', '5', '6', '7', '8'];
        for (let i = 0; i < 8; i++) {
            const letter = new Text(letters[i], {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: '#ffffff'
            });

            letter.x = i * 32 + padding + 10;
            letter.y = 32 * 8 + padding;
            letter.zIndex = BACKGROUND_ZINDEX + 1;
            this.app.stage.addChild(letter);
        }

        for (let i = 0; i < 8; i++) {
            const number = new Text(numbers[i], {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: '#ffffff'
            });

            number.x = 10;
            number.y = 8 * 32 - (i * 32);
            number.zIndex = BACKGROUND_ZINDEX + 1;
            this.app.stage.addChild(number);
        }
    }
    // draw a chess board
    private drawChessBoard(padding: number, scale = 1) {
        // outer border
        const graphics = new Graphics();
        graphics.beginFill(0xcb9154);
        graphics.drawRect(0, 0, 32 * 10 * scale, 32 * 10 * scale);
        graphics.zIndex = BACKGROUND_ZINDEX;
        this.app.stage.addChild(graphics);

        // inner board
        let colorIndex = 0;
        const colors = [0xd1d1d1, 0x5c5c5c];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const cell = new Graphics();
                cell.beginFill(colors[colorIndex]);
                colorIndex = (colorIndex + 1) % 2;
                cell.drawRect(i * 32 + padding, j * 32 + padding, 32, 32);
                cell.scale.x = scale;
                cell.scale.y = scale;
                cell.zIndex = SQURE_ZINDEX;
                this.app.stage.addChild(cell);
            }
            colorIndex = (colorIndex + 1) % 2;
        }
    }

}

function initApp(): Application {
    //Construct a Pixi.JS application
    const app = new Application({
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1,
    });
    app.renderer.view.style.position = 'absolute';
    app.renderer.view.style.display = 'block';

    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.stage.sortableChildren = true;

    document.body.appendChild(app.view);
    return app;
}

// get piece sprite
function createPieceSprite(sheet: Spritesheet, pieceType: PieceType, pieceColor: PieceColor, i: number, j: number, chess: ChessInstance): PieceSprite {
    const name = `${pieceColor}${pieceType}`;
    const texture = sheet.textures[name];
    const sprite = new PieceSprite(texture, name, pieceColor, i, j, chess);
    sprite.addListener('click', (e) => pieceOnclick(e, sprite));
    return sprite;
}

// calculate the position of the piece
function positionMapping(square: Square) {
    const { i, j } = toIndex(square);
    const y = i * 32;
    const x = j * 32;
    return { x, y };
}

// pieces onClick 
function pieceOnclick(e, piece: PieceSprite) {
    if (globalState.turn !== piece.color) {
        return;
    }
    selectedPiece = piece;
    selectedPiece.activeState();
    const p = toSquare(selectedPiece.i, selectedPiece.j);
    const aviliablePosstions = chess.moves({ square: p, verbose: true });
    // todo draw a cycle on aviliable square
    console.log('onClick ', piece.name, p);
    console.log('aviliable postions', chess.moves({ square: p }));
    const highlights: Graphics[] = [];
    for (const move of aviliablePosstions) {
        const { x, y } = positionMapping(move.to);
        const highlight = new Graphics();
        highlight.beginFill(0xfa66a5);
        highlight.drawRect(x + padding, y + padding, 32, 32);
        highlight.alpha = 0.5;
        highlight.zIndex = HIGHLIGHT_ZINDEX;
        highlight.interactive = true;
        highlight.buttonMode = true;
        highlight.addListener('click', () => {
            if (pieceMove(piece, move.to)) {
                globalState.turn = chess.turn();
                globalState.lastMove = { from: p, to: move.to };
                console.log('move to ', move.to);
                piece.deactiveState();

                // remove all highlight
                for (const highlight of highlights) {
                    app.stage.removeChild(highlight);
                    highlight.destroy();
                }

            }
        });

        app.stage.addChild(highlight);
        highlights.push(highlight);
    }

    console.log('highlights', chess.moves({ square: p }));
}

// pieces move
function pieceMove(piece: PieceSprite, to: Square): Move | null {
    const fromSqure = toSquare(piece.i, piece.j);
    const result = chess.move({ from: fromSqure, to: to });
    console.log('move result', result);
    if (result) {
        // if capture piece
        if (result.captured) {
            const capturedPiece = aboardMap.get(to);
            if (capturedPiece) {
                app.stage.removeChild(capturedPiece);
                aboardMap.delete(to);
            }
        }
        piece.moveToSquare(to);
    } else {
        console.log(`${fromSqure} can't move to ${to}`);
    }

    return result;
}