import { expect, test } from 'vitest'
import { toIndex, toSquare} from '../../utils/mapping'

test('mapping.toIndex(square)', () => {
    expect(toIndex('a1')).toEqual({i: 7, j: 0})
    expect(toIndex('h1')).toEqual({i: 7, j: 7})
    expect(toIndex('a8')).toEqual({i: 0, j: 0})
    expect(toIndex('h8')).toEqual({i: 0, j: 7})
    expect(toIndex('e4')).toEqual({i: 4, j: 4})
})

test('mapping.toSquare(i, j)', () => {
    expect(toSquare(0, 0)).toEqual('a8')
    expect(toSquare(0, 7)).toEqual('h8')
})