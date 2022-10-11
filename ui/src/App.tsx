import { Component, createSignal } from 'solid-js';
import { Connection } from './runtime/ConnectionManager';
import { ConnectionOptions } from './runtime/types';
import { StoreTest } from './StoreTest';

const App: Component = () => {

  const [options, setOptions] = createSignal<ConnectionOptions>({
    endpoint: 'http://localhost:8080',
    session: {
      aquire: true,
      storage: localStorage
    },
  })

  return (<>
    <StoreTest />
    <Connection
      options={options()}
    />
  </>);
};

export default App;
