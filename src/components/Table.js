import React, { useState, useEffect } from 'react';
import { Parser as FormulaParser } from 'hot-formula-parser';

import Row from './Row';

const Table = (props) => {
  const [data, setData] = useState({});
  const [parser, setParser] = useState(new FormulaParser());

  useEffect(() => {
    parser.on('callCellValue', (CellCoord, done) => {
      const y = CellCoord.row.index + 1;
      const x = CellCoord.column.index + 1;

      if (x > props.x || y > props.y) {
        console.error('cCV out of range');
        throw parser.Error(parser.ERROR_NOT_AVAILABLE);
      }

      if (parser.cell.x === x && parser.cell.y === y) {
        console.error('cCV circular ref');
        throw parser.Error(parser.ERROR_REF);
      }

      if (!data[y] || !data[y][x]) return done('');

      done(data[y][x]);
    });

    parser.on('callRangeValue', (startCellCoord, endCellCoord, done) => {
      const sy = startCellCoord.row.index + 1;
      const sx = startCellCoord.column.index + 1;
      const ey = endCellCoord.row.index + 1;
      const ex = endCellCoord.column.index + 1;

      // console.log({ sy, sx, ey, ex });

      const fragment = [];

      for (let y = sy; y <= ey; ++y) {
        const row = data[y];

        if (!row) continue;

        const colFragment = [];

        for (let x = sx; x <= ex; ++x) {
          let value = row[x];

          if (!value) value = '';

          if (value[0] === '=') {
            const res = executeFormula({ x, y }, value.substring(1));

            if (res.error) {
              console.error('cRV', { res });
              throw parser.Error(res.error);
            }

            value = res.result;
          }

          colFragment.push(value);
        }

        fragment.push(colFragment);
      }

      done(fragment);
    });
  }, []);

  const handleChangedCell = ({ x, y }, value) => {
    const modifiedData = { ...data };

    if (!modifiedData[y]) modifiedData[y] = {};

    modifiedData[y][x] = value;

    setData(modifiedData);
  };

  const updateCells = () => {
    this.forceUpdate();
  };

  const executeFormula = (cell, value) => {
    parser.cell = cell;

    let res = parser.parse(value);

    if (res.error || res.result.toString() === '') return res;

    if (res.result.toString()[0] === '=')
      res = executeFormula(cell, res.result.toString().substring(1));

    return res;
  };

  const rows = [];

  for (let y = 0; y < props.y + 1; ++y) {
    const rowData = data[y] || {};

    rows.push(
      <Row
        handleChangedCell={handleChangedCell}
        updateCells={updateCells}
        executeFormula={executeFormula}
        key={y}
        y={y}
        x={props.x + 1}
        rowData={rowData}
      />
    );
  }

  return <div>{rows}</div>;
};

export default Table;
