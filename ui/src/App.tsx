import type { Component } from 'solid-js';
import { StoreTest } from './StoreTest';

const App: Component = () => {
  return (<>
    <p class="text-4xl text-green-700 text-center py-20">Hello tailwind!</p>
    <StoreTest />
  </>);
};

export default App;
