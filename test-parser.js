const Parser = require('hot-formula-parser').Parser;

const parser = new Parser();

parser.on('callCellValue', (cellCoord, done) => {
  console.log('cCV', cellCoord);

  done(cellCoord.row.index * cellCoord.column.index);
});

parser.on('callRangeValue', (startCoord, endCoord, done) => {
  const { index: sx } = startCoord.column;
  const { index: ex } = endCoord.column;
  const { index: sy } = startCoord.row;
  const { index: ey } = endCoord.row;

  console.log('cRV', startCoord, endCoord, { sx, sy, ex, ey });

  const retval = [];

  for (let row = sy; row <= ey; ++row) {
    const rowval = [];

    for (let col = sx; col <= ex; ++col) {
      rowval.push(row * col);
    }

    retval.push(rowval);
  }

  done(retval);
});

function showResult(parser, content) {
  const res = parser.parse(content);

  if (res.error) return console.log(`'${content}' ERROR  ${res.error}`);

  console.log(`'${content}' = ${res.result}`);
}

showResult(parser, '1 + 5 / 10');
showResult(parser, 'SUM(1, 2, 3)');
showResult(parser, 'B2 + B3');
showResult(parser, 'SUM(B2:C6)');
