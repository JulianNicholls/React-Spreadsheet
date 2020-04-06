import React from 'react';
import './App.css';

import Table from './components/Table';

const App = () => {
  return (
    <div style={{ width: 'content-max', margin: '0 auto' }}>
      <Table x={10} y={10} />
    </div>
  );
};

export default App;
