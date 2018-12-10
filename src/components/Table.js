import React, { Component } from 'react';

import Row from './Row';

class Table extends Component {
  state = { data: {} };

  handleChangedCell = ({ x, y }, value) => {
    const modifiedData = { ...this.state.data };

    if (!modifiedData[y]) modifiedData[y] = {};

    modifiedData[y][x] = value;

    this.setState({ data: modifiedData });
  };

  updateCells = () => {
    this.forceUpdate();
  };

  render() {
    const rows = [];

    for (let y = 0; y < this.props.y + 1; ++y) {
      const rowData = this.state.data[y] || {};

      rows.push(
        <Row
          handleChangedCell={this.handleChangedCell}
          updateCells={this.updateCells}
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
