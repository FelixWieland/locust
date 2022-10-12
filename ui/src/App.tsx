import { Component, createSignal } from 'solid-js';
import { Connection } from './runtime';
import { PartialOptions } from './runtime/types';
import { Test } from './Test';

const App: Component = () => {
  return (<>
    <Test />
    <Connection
      options={{
        endpoint: 'http://192.168.178.161:8080',
        sessionAquire: true
      }}
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