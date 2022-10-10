import { Component, createSignal } from 'solid-js';
import { Connection } from './runtime/ConnectionManager';
import { StoreTest } from './StoreTest';

const App: Component = () => {

  const [options, setOptions] = createSignal({
    endpoint: 'http://192.168.178.161:8080',
    session: true,
    sidebar: {

    }
  })

  return (<>
    <StoreTest />
    <Connection
      options={options()}
    />
  </>);
};

export default App;
