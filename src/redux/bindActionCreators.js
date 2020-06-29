function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(this, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass an action creator as the first argument,
 * and get a dispatch wrapped function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
// 这个的使用场景是简化 dispatch 的调用
export default function bindActionCreators(actionCreators, dispatch) {
  // actionCreators为function
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  // 不是 function 也不是 object 类型 ，则抛出错误
  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(
      `bindActionCreators expected an object or a function, instead received ${
        actionCreators === null ? 'null' : typeof actionCreators
      }. ` +
        `Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`
    );
  }

  const boundActionCreators = {};
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;

  // redux 4.0.1 版本写法：
  // const keys = Object.keys(actionCreators);
  // // 定义return 的props
  // const boundActionCreators = {};
  // for (let i = 0; i < keys.length; i++) {
  //   // actionCreators的key 通常为actionCreators function的name（方法名）
  //   const key = keys[i];
  //   const actionCreator = actionCreators[key]; // 工厂方法本身
  //   if (typeof actionCreator === 'function') {
  //     // 参数为{actions：function xxx}是返回相同的类型
  //     boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
  //   }
  // }
  // // return 的props
  // return boundActionCreators;
}

// 以前使用：
// TodoActionCreators.js
// export function addTodo(text) {
//   return {
//     type: 'ADD_TODO',
//     text
//   };
// }
// export function removeTodo(id) {
//   return {
//     type: 'REMOVE_TODO',
//     id
//   };
// }

// import * as TodoActionCreators from './TodoActionCreators';

// let addReadAction = TodoActionCreators.addTodo('看书');
// dispatch(addReadAction);

// let addEatAction = TodoActionCreators.addTodo('吃饭');
// dispatch(addEatAction);

// let removeEatAction = TodoActionCreators.removeTodo('看书');
// dispatch(removeEatAction);

// 使用 bindActionCreators 之后：
// import * as TodoActionCreators from './TodoActionCreators';
// let TodoAction = bindActionCreators(TodoActionCreators, dispatch);

// TodoAction.addTodo('看书')
// TodoAction.addTodo('吃饭')
// TodoAction.removeTodo('看书')
