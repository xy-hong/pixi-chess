import { Chess, ChessInstance, Move, PieceType, Square } from "chess.js";
import { Application, Graphics, Spritesheet, Text, TextStyle } from "pixi.js";
import PieceSprite from "../entity/PieceSprite";
import { PieceColor } from "../types";
import { positionMapping } from "../utils/mapping";
import { PieceSelectedEvent } from "./events/piece";
import { PADDING, SCALE } from "./setting";
import { toSquare } from "../utils/mapping";

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

export class World {
    app: Application;
    chess: ChessInstance;
    chessSheet: Spritesheet;
    allPieces: PieceSprite[] = [];
    state: {
        lastMove: { from: Square, to: Square; } | { from: null, to: null; },
        selected: PieceSprite | null;
        highlights: Graphics[];
        lastMoveHighLight: Graphics[];
   };

    constructor() {
        this.app = this.initApp();
        this.chess = new Chess();
        this.state = {
            lastMove: { from: null, to: null },
            selected: null,
            highlights: [],
            lastMoveHighLight: []
        };
    }

    setUp() {
        this.registerEvents();
        this.app.loader
            .add("image/chess.json")
            .add("image/chess_active.json")
            .load(() => {
                this.chessSheet = this.app.loader.resources["image/chess.json"].spritesheet!!;
                // const activeChessSheet = this.app.loader.resources["image/chess_active.json"].spritesheet;
                this.drawChessBoard();
                const initBoard = this.chess.board();
                this.setupPiece(initBoard);
                this.drawSquareLabel();
            });

        this.test()
        // Listen for animate update
        this.app.ticker.add((delta) => {
            // use delta to create frame-independent transform
            // container.rotation -= 0.01 * delta;
        });
    }

    private test() {
        this.renderGameOver()
        button
    }

    private initApp(): Application {
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

    private setupPiece(position, padding: number=PADDING, scale: number=SCALE) {
        console.log(position);
        const turn = this.chess.turn();
        console.log(turn);
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const cell = position[i][j];
                if (cell) {
                    // load sprite
                    const sprite = this.createPieceSprite(cell.type, cell.color, i, j);
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
    private drawSquareLabel() {
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const numbers = ['1', '2', '3', '4', '5', '6', '7', '8'];
        for (let i = 0; i < 8; i++) {
            const letter = new Text(letters[i], {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: '#ffffff'
            });

            letter.x = i * 32 + PADDING + 10;
            letter.y = 32 * 8 + PADDING;
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
    private drawChessBoard() {
        // outer border
        const graphics = new Graphics();
        graphics.beginFill(0xcb9154);
        graphics.drawRect(0, 0, 32 * 10 * SCALE, 32 * 10 * SCALE);
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
                cell.drawRect(i * 32 + PADDING, j * 32 + PADDING, 32, 32);
                cell.scale.x = SCALE;
                cell.scale.y = SCALE;
                cell.zIndex = SQURE_ZINDEX;
                this.app.stage.addChild(cell);
            }
            colorIndex = (colorIndex + 1) % 2;
        }
    }

    private registerEvents() {
        this.app.stage.on('pieceSelectedEvent', (ev: PieceSelectedEvent, msg) => {
            this.changeSelected(ev.piece);
        });
    }

    // get piece sprite
    public createPieceSprite(pieceType: PieceType, pieceColor: PieceColor, i: number, j: number): PieceSprite {
        const name = `${pieceColor}${pieceType}`;
        const texture = this.chessSheet.textures[name];
        const sprite = new PieceSprite(texture, name, pieceColor, i, j);
        return sprite;
    }

    public renderGameOver() {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440,
            lineJoin: 'round',
        });

        const text = new Text(`Game Over!`, style);
        text.x = 50;
        text.y = 220;
        text.zIndex = 999;
        this.app.stage.addChild(text)
    }

    changeSelected(piece: PieceSprite) {
        if (this.state.selected === piece) {
            return;
        }
        const world = getWorld();
        const from = toSquare(piece.i, piece.j)
        const moveablePos = world.chess.moves({ square: from, verbose: true })
        this.cleanHiglights();
        this.state.selected = piece;
        for (const move of moveablePos) {
            const { x, y } = positionMapping(move.to);
            const hl = this.newHighLight(x, y);
            if (move.flags.indexOf("p") >= -1) {
                // TODO 需要弹出升级选择
                hl.addListener('click', () => {
                    const moveResult = world.chess.move({ from: from, to: move.to, promotion: "q" })
                    if (moveResult) {

                        if (world.chess.game_over()) {
                            alert("Game Over");
                            this.renderGameOver()
                        }

                        world.renderPieces();
                        world.state.lastMove = { from: from, to: move.to };
                        console.info('move to ', move.to);
                        piece.deactiveState();
                        this.cleanHiglights();
                    }
                });


            } else {
                hl.addListener('click', () => {
                    const moveResult = world.chess.move({ from: from, to: move.to })
                    if (moveResult) {

                        if (world.chess.game_over()) {
                            alert("Game Over");
                        }

                        world.renderPieces();
                        world.state.lastMove = { from: from, to: move.to };
                        console.info('move to ', move.to);
                        piece.deactiveState();
                        this.cleanHiglights();
                    }
                });
            }
            world.app.stage.addChild(hl);
            this.state.highlights.push(hl);
        }
        console.log('highlights', world.chess.moves({ square: from, verbose: true }));
    }

    private cleanHiglights() {
        console.log('cleaning')
        for (const h of this.state.highlights) {
            h.destroy();
        }
        this.state.highlights = [];
    }

    private cleanLastMoveHighLight() {
        for (const hl of this.state.lastMoveHighLight) {
            hl.destroy();
        }
    }

    private newHighLight(x: number, y: number): Graphics {
        const hl = new Graphics();
        hl.beginFill(0xfa66a5);
        hl.drawRect(x + PADDING, y + PADDING, 32, 32);

        hl.alpha = 0.5;
        hl.zIndex = HIGHLIGHT_ZINDEX;
        hl.interactive = true;
        hl.buttonMode = true;
        return hl;
    }


}