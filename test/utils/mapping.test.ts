import { expect, test } from 'vitest'
import { toIndex, toSquare} from '../../utils/mapping'

test('mapping.toIndex(square)', () => {
    expect(toIndex('a1')).eq({i: 7, j: 0})
    expect(toIndex('h1')).eq({i: 7, j: 7})
    expect(toIndex('a8')).eq({i: 0, j: 0})
    expect(toIndex('h8')).eq({i: 0, j: 7})
    expect(toIndex('e4')).eq({i: 4, j: 4})
})

test('mapping.toSquare(i, j)', () => {
    expect(toSquare(0, 0)).eq('a8')
    expect(toSquare(0, 7)).eq('h8')
})