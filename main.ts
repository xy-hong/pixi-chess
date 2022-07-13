import { Application, Graphics, Spritesheet, Text, Rectangle } from 'pixi.js';
import { Chess, Move, PieceType, Square} from 'chess.js';
import { toIndex, toSquare } from './utils/mapping';
import  PieceSprite  from './entity/PieceSprite';
import globalState from './global';
import { PieceColor } from './types';

//Construct a Pixi.JS application
const app = new Application({
  backgroundColor: 0x000000,
  resolution: window.devicePixelRatio || 1,
});

app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';

app.renderer.resize(window.innerWidth, window.innerHeight);
app.stage.sortableChildren = true

document.body.appendChild(app.view);

const chess = new Chess();
const scale = 1
const padding = 32 * scale
const aboardMap = new Map<Square, PieceSprite>();
let selectedPiece: PieceSprite | null = null;

const BACKGROUND_ZINDEX = 0
const SQURE_ZINDEX = 1
const HIGHLIGHT_ZINDEX = 2

setup();

function setup() {
  const initBoard = chess.board();
  app.loader
  .add("image/chess.json")
  .add("image/chess_active.json")
  .load(() => {
    const chessSheet = app.loader.resources["image/chess.json"].spritesheet;
    const activeChessSheet = app.loader.resources["image/chess_active.json"].spritesheet
    drawChessBoard(padding, scale);
    setupPiece(initBoard, chessSheet!!, padding)
    setupSquareLabel(padding, scale)
  })

  // Listen for animate update
  app.ticker.add((delta) => {
    // use delta to create frame-independent transform
    // container.rotation -= 0.01 * delta;
  });


}

function setupPiece(position, sheet: Spritesheet, padding: number, scale = 1) {
  console.log(position)
  for (let i=0; i<8; i++) {
    for(let j=0; j<8; j++) {
      const cell = position[i][j]
      if(cell) {
        // load sprite
        const sprite = createPieceSprite(sheet, cell.type, cell.color, i, j);
        const {x, y} = positionMapping(cell.square);
        sprite.x = x + padding;
        sprite.y = y + padding;
        
        app.stage.addChild(sprite);
        aboardMap.set(cell.square, sprite);
      }
    }
  }
}

// setup square label
function setupSquareLabel(padding: number, scale = 1) {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8']
  for(let i=0; i<8 ;i++){
    const letter = new Text(letters[i], {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#ffffff'
    })

    letter.x = i * 32 + padding + 10;
    letter.y = 32 * 8 + padding;
    letter.zIndex = BACKGROUND_ZINDEX + 1
    app.stage.addChild(letter);
  }

  for(let i=0; i<8 ;i++){
    const number = new Text(numbers[i], {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#ffffff'
    })

    number.x = 10;
    number.y = 8 * 32 - (i * 32)
    number.zIndex = BACKGROUND_ZINDEX + 1
    app.stage.addChild(number);
  }
}

// draw a chess board
function drawChessBoard(padding: number, scale = 1) {
  // outer border
  const graphics = new Graphics();
  graphics.beginFill(0xcb9154)
  graphics.drawRect(0, 0, 32 * 10 * scale, 32 * 10 * scale);
  graphics.zIndex = BACKGROUND_ZINDEX
  app.stage.addChild(graphics);

  // inner board
  let colorIndex = 0;
  const colors = [0xd1d1d1, 0x5c5c5c];
  for(let i=0; i<8; i++) {
    for(let j=0; j<8; j++) {
      const cell = new Graphics();
      cell.beginFill(colors[colorIndex]);
      colorIndex = (colorIndex + 1) % 2;
      cell.drawRect(i*32 + padding, j*32 + padding, 32, 32);
      cell.scale.x = scale
      cell.scale.y = scale
      cell.zIndex = SQURE_ZINDEX
      app.stage.addChild(cell);
    }
    colorIndex = (colorIndex + 1) % 2;
  }
}

// get piece sprite
function createPieceSprite(sheet: Spritesheet, pieceType: PieceType, pieceColor: PieceColor, i: number, j: number): PieceSprite {
  const name = `${pieceColor}${pieceType}`
  const texture = sheet.textures[name];
  const sprite = new PieceSprite(texture, name, pieceColor, i, j);
  sprite.interactive = true
  sprite.buttonMode = true
  sprite.zIndex = 100
  sprite.hitArea = new Rectangle(0, 0, 32, 32);
  sprite.addListener('click', (e)=> pieceOnclick(e, sprite))
  return sprite;
}

// calculate the position of the piece
function positionMapping(square: Square) {
  const {i, j} = toIndex(square)
  const y = i * 32;
  const x = j * 32;
  return {x, y} 
}

// pieces onClick 
function pieceOnclick(e, piece: PieceSprite) {
  if(globalState.turn !== piece.color) {
    return;
  }
  selectedPiece = piece;
  selectedPiece.activeState();
  const p = toSquare(selectedPiece.i, selectedPiece.j)
  const aviliablePosstions = chess.moves({square: p, verbose: true})
  // todo draw a cycle on aviliable square
  console.log('onClick ', piece.name, p)
  console.log('aviliable postions', chess.moves({square: p}))
  const highlights :Graphics[] = []
  for(const move of aviliablePosstions) {
      const {x, y} = positionMapping(move.to)
      const highlight = new Graphics()
      highlight.beginFill(0xfa66a5)
      highlight.drawRect(x + padding, y + padding, 32, 32);
      highlight.alpha = 0.5
      highlight.zIndex = HIGHLIGHT_ZINDEX
      highlight.interactive = true
      highlight.buttonMode = true
      highlight.addListener('click', ()=> {
        if(pieceMove(piece, move.to)){
          globalState.turn = chess.turn()
          globalState.lastMove = { from: p, to: move.to }
          console.log('move to ', move.to)
          piece.deactiveState()
          
          // remove all highlight
          for(const highlight of highlights) {
            app.stage.removeChild(highlight)
            highlight.destroy()
          }

        }
      })
        
      app.stage.addChild(highlight)
      highlights.push(highlight)
  }   
  
  console.log('highlights', chess.moves({square: p}))
}

// pieces move
function pieceMove(piece: PieceSprite, to: Square): Move | null {
  const fromSqure = toSquare(piece.i, piece.j)
  const result = chess.move({from: fromSqure, to: to})
  console.log('move result', result)
  if(result) {
    // if capture piece
    if(result.captured) {
      const capturedPiece = aboardMap.get(to)
      if(capturedPiece) {
        app.stage.removeChild(capturedPiece)
        aboardMap.delete(to)
      }
    }
    piece.moveToSquare(to)
  } else {
    console.log(`${fromSqure} can't move to ${to}`)
  }

  return result
}