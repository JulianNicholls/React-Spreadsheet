import React from 'react';

import Cell from './Cell';

interface RowProps {
  x: number;
  y: number;
  rowData: RowType;
  handleChangedCell: (loc: XY, value: string) => void;
  updateCells: () => void;
  executeFormula: (cell: CellType, value: string) => void;
}
const Row = ({
  x: cols,
  y,
  handleChangedCell,
  updateCells,
  executeFormula,
  rowData,
}: RowProps): React.ReactNode => {
  const cells = [];

  for (let x = 0; x < cols; ++x) {
    cells.push(
      <Cell
        key={`${y}-${x}`}
        y={y}
        x={x}
        onChangedValue={handleChangedCell}
        updateCells={updateCells}
        executeFormula={executeFormula}
        value={rowData[x] || ''}
      />
    );
  }
  return <div>{cells}</div>;
};

export default Row;
