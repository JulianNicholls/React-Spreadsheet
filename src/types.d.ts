declare module 'hot-formula-parser';

type XY = { x: number; y: number };

type RowType = Array<string>;

interface CellType {
  loc: XY;
  value: string;
}
