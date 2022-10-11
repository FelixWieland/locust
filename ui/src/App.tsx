import { Component, createSignal } from 'solid-js';
import { Connection } from './runtime/ConnectionManager';
import { ConnectionOptions } from './runtime/types';
import { Test } from './Test';

const App: Component = () => {

  const [options, setOptions] = createSignal<ConnectionOptions>({
    endpoint: 'http://192.168.178.161:8080',
    session: {
      aquire: true,
      storage: localStorage
    },
  })

  return (<>
    <Test />
    <Connection
      options={options()}
    />
  </>);
};

export default App;


/*
storage: {
        getItem: (key: string) => {
          const params = new URLSearchParams(window.location.search);
          if (params.has('s')) {
            return params.get('s')
          }
          return ''
        },
        setItem: (key: string, value: string) => {
          const params = new URLSearchParams(window.location.search);
          if (!(params.has('s') && params.get('s') === value)) {
            window.location.search = `?s=${value}`
          }
        }
      }
*/