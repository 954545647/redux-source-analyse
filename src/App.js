import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from './redux';
import rootReducer from './reducers';
import Counter from './components/Counter';
import Theme from './components/Theme';

function logger1({ getState }) {
  return function log1(next) {
    return function l1(action) {
      // console.log('will dispatch--1--next, action:', next, action);

      // Call the next dispatch method in the middleware chain.
      const returnValue = next(action);

      // console.log('state after dispatch--1', getState());

      return returnValue;
    };
  };
}

function logger2({ getState }) {
  return function log2(next) {
    return function l2(action) {
      // console.log('will dispatch--2--next, action:', next, action);

      const returnValue = next(action);

      // console.log('state after dispatch--2', getState());

      return returnValue;
    };
  };
}

function logger3(store) {
  return function log3(next) {
    return function l3(action) {
      // console.log('will dispatch--3--next, action:', next, action);

      const returnValue = next(action);

      // console.log('state after dispatch--3', getState());

      // 可能返回 action 本身，除非在中间件执行链中某一个中间件改变了它
      return returnValue;
    };
  };
}

let store = createStore(
  rootReducer,
  applyMiddleware(logger1, logger2, logger3)
);

function App() {
  return (
    <Provider store={store}>
      <div className="wrapper">
        <Counter />
        <Theme />
      </div>
    </Provider>
  );
}

export default App;
