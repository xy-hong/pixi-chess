import { Chess, ChessInstance, Move, PieceType, Square } from "chess.js";
import { Application, Graphics, Spritesheet, Text } from "pixi.js";
import PieceSprite from "../entity/PieceSprite";
import { PieceColor } from "../types";
import { positionMapping } from "../utils/mapping";
import { EvPieceSelected } from "./events/piece";
import { HighlightManager } from "./highLightManager";

const SCALE = 1;
const PADDING = 32 * SCALE;

const BACKGROUND_ZINDEX = 0;
const SQURE_ZINDEX = 1;

let world: World;
export function getWorld() {
    if (!world) {
        world = new World();
    }
    return world;
}

export class World {
    app: Application;
    chess: ChessInstance;
    hlManager: HighlightManager;
    chessSheet: Spritesheet;
    allPieces: PieceSprite[] = [];
    state: {
        lastMove: { from: Square, to: Square; } | { from: null, to: null; },
    };

    constructor() {
        this.app = initApp();
        this.chess = new Chess();
        this.hlManager = new HighlightManager(PADDING);
        this.state = {
            lastMove: { from: null, to: null }
        };
    }

    setUp() {
        const initBoard = this.chess.board();
        this.registerEvents();
        this.app.loader
            .add("image/chess.json")
            .add("image/chess_active.json")
            .load(() => {
                this.chessSheet = this.app.loader.resources["image/chess.json"].spritesheet!!;
                // const activeChessSheet = this.app.loader.resources["image/chess_active.json"].spritesheet;
                this.drawChessBoard(PADDING, SCALE);
                this.setupPiece(initBoard);
                this.setupSquareLabel(PADDING, SCALE);
            });

        // Listen for animate update
        this.app.ticker.add((delta) => {
            // use delta to create frame-independent transform
            // container.rotation -= 0.01 * delta;
        });
    }

    private destoryAllPieces() {
        for (const piece of this.allPieces) {
            this.app.stage.removeChild(piece);
        }
    }

    public renderPieces() {
        const position = this.chess.board();
        this.destoryAllPieces();
        this.setupPiece(position);
    }   

    private setupPiece(position, padding: number=PADDING, scale = 1) {
        console.log(position);
        const turn = this.chess.turn();
        console.log(turn);
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const cell = position[i][j];
                if (cell) {
                    // load sprite
                    const sprite = this.createPieceSprite(cell.type, cell.color, i, j, this.chess);
                    if(cell.color == turn) {
                        sprite.interactive = true;
                        sprite.buttonMode = true
                    }else{
                        sprite.interactive = false;
                    }
                    
                    // TODO move these code  snippets to piece's constructor
                    const { x, y } = positionMapping(cell.square);
                    sprite.x = x + padding;
                    sprite.y = y + padding;

                    this.allPieces.push(sprite);
                    this.app.stage.addChild(sprite);
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

    private registerEvents() {
        this.app.stage.on('evPieceSelected', (ev: EvPieceSelected, msg) => {
            this.hlManager.changeSelected(ev.piece, ev.moveablePos);
        });
    }

    // get piece sprite
    public createPieceSprite(pieceType: PieceType, pieceColor: PieceColor, i: number, j: number, chess: ChessInstance): PieceSprite {
        const name = `${pieceColor}${pieceType}`;
        const texture = this.chessSheet.textures[name];
        const sprite = new PieceSprite(texture, name, pieceColor, i, j, chess);
        return sprite;
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



