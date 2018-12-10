import React from 'react';

import Cell from './Cell';

const Row = props => {
  const cells = [];
  const { x: cols, y, handleChangedCell, updateCells, rowData } = props;

  for (let x = 0; x < cols; ++x) {
    cells.push(
      <Cell
        key={`${y}-${x}`}
        y={y}
        x={x}
        onChangedValue={handleChangedCell}
        updateCells={updateCells}
        value={rowData[x] || ''}
      />
    );
  }
  return <div>{cells}</div>;
};

export default Row;
