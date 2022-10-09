import type { Component } from 'solid-js';
import { Connection } from './runtime/ConnectionManager';
import { StoreTest } from './StoreTest';

const App: Component = () => {
  return (<>
    <p class="text-4xl text-green-700 text-center py-20">Hello tailwind!</p>
    <StoreTest />
    <Connection 
      endpoint='http://localhost:8080'
    />
  </>);
};

export default App;
