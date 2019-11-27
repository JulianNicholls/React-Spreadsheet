import React, { Component } from 'react';
import { Parser as FormulaParser } from 'hot-formula-parser';

import Row from './Row';

class Table extends Component {
  constructor(props) {
    super(props);

    this.state = { data: {} };

    this.parser = new FormulaParser();

    this.parser.on('callCellValue', (CellCoord, done) => {
      const y = CellCoord.row.index + 1;
      const x = CellCoord.column.index + 1;
      const { data } = this.state;

      if (x > this.props.x || y > this.props.y) {
        console.error('cCV out of range');
        throw this.parser.Error(this.parser.ERROR_NOT_AVAILABLE);
      }

      if (this.parser.cell.x === x && this.parser.cell.y === y) {
        console.error('cCV circular ref');
        throw this.parser.Error(this.parser.ERROR_REF);
      }

      if (!data[y] || !data[y][x]) return done('');

      done(data[y][x]);
    });

    this.parser.on('callRangeValue', (startCellCoord, endCellCoord, done) => {
      const sy = startCellCoord.row.index + 1;
      const sx = startCellCoord.column.index + 1;
      const ey = endCellCoord.row.index + 1;
      const ex = endCellCoord.column.index + 1;

      // console.log({ sy, sx, ey, ex });

      const fragment = [];
      const { data } = this.state;

      for (let y = sy; y <= ey; ++y) {
        const row = data[y];

        if (!row) continue;

        const colFragment = [];

        for (let x = sx; x <= ex; ++x) {
          let value = row[x];

          if (!value) value = '';

          if (value[0] === '=') {
            const res = this.executeFormula({ x, y }, value.substring(1));

            if (res.error) {
              console.error('cRV', { res });
              throw this.parser.Error(res.error);
            }

            value = res.result;
          }

          colFragment.push(value);
        }

        fragment.push(colFragment);
      }

      done(fragment);
    });
  }

  handleChangedCell = ({ x, y }, value) => {
    const modifiedData = { ...this.state.data };

    if (!modifiedData[y]) modifiedData[y] = {};

    modifiedData[y][x] = value;

    this.setState({ data: modifiedData });
  };

  updateCells = () => {
    this.forceUpdate();
  };

  executeFormula = (cell, value) => {
    this.parser.cell = cell;

    let res = this.parser.parse(value);

    if (res.error || res.result.toString() === '') return res;

    if (res.result.toString()[0] === '=')
      res = this.executeFormula(cell, res.result.toString().substring(1));

    return res;
  };

  render() {
    const rows = [];

    for (let y = 0; y < this.props.y + 1; ++y) {
      const rowData = this.state.data[y] || {};

      rows.push(
        <Row
          handleChangedCell={this.handleChangedCell}
          updateCells={this.updateCells}
          executeFormula={this.executeFormula}
          key={y}
          y={y}
          x={this.props.x + 1}
          rowData={rowData}
        />
      );
    }

    return <div>{rows}</div>;
  }
}

export default Table;
