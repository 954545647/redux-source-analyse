import ActionTypes from './utils/actionTypes';
import warning from './utils/warning';
import isPlainObject from './utils/isPlainObject';

function getUndefinedStateErrorMessage(key, action) {
  const actionType = action && action.type;
  const actionDescription =
    (actionType && `action "${String(actionType)}"`) || 'an action';

  return (
    `Given ${actionDescription}, reducer "${key}" returned undefined. ` +
    `To ignore an action, you must explicitly return the previous state. ` +
    `If you want this reducer to hold no value, you can return null instead of undefined.`
  );
}

function getUnexpectedStateShapeWarningMessage(
  inputState,
  reducers,
  action,
  unexpectedKeyCache
) {
  const reducerKeys = Object.keys(reducers);
  const argumentName =
    action && action.type === ActionTypes.INIT
      ? 'preloadedState argument passed to createStore'
      : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return (
      'Store does not have a valid reducer. Make sure the argument passed ' +
      'to combineReducers is an object whose values are reducers.'
    );
  }

  if (!isPlainObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "` +
      {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      `". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join('", "')}"`
    );
  }

  const unexpectedKeys = Object.keys(inputState).filter(
    (key) => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
  );

  unexpectedKeys.forEach((key) => {
    unexpectedKeyCache[key] = true;
  });

  if (action && action.type === ActionTypes.REPLACE) return;

  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'} ` +
      `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
      `Expected to find one of the known reducer keys instead: ` +
      `"${reducerKeys.join('", "')}". Unexpected keys will be ignored.`
    );
  }
}

function assertReducerShape(reducers) {
  Object.keys(reducers).forEach((key) => {
    const reducer = reducers[key];
    const initialState = reducer(undefined, { type: ActionTypes.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
          `If the state passed to the reducer is undefined, you must ` +
          `explicitly return the initial state. The initial state may ` +
          `not be undefined. If you don't want to set a value for this reducer, ` +
          `you can use null instead of undefined.`
      );
    }

    if (
      typeof reducer(undefined, {
        type: ActionTypes.PROBE_UNKNOWN_ACTION()
      }) === 'undefined'
    ) {
      throw new Error(
        `Reducer "${key}" returned undefined when probed with a random type. ` +
          `Don't try to handle ${ActionTypes.INIT} or other actions in "redux/*" ` +
          `namespace. They are considered private. Instead, you must return the ` +
          `current state for any unknown actions, unless it is undefined, ` +
          `in which case you must return the initial state, regardless of the ` +
          `action type. The initial state may not be undefined, but can be null.`
      );
    }
  });
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
// 用于合并reducer 一般是这样combineReducers({a,b,c})
export default function combineReducers(reducers) {
  // reducers中key的数组
  const reducerKeys = Object.keys(reducers);

  // 最终的reducer
  const finalReducers = {};
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];

    // 如果是开发环境， 当前的reducer是undefined会给出warning
    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`);
      }
    }

    // reducer必须要是一个function
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
    // 循环结束，目的是过虑了不符合规范（不是一个function）的reudcer
  }
  // 符合规范的reducer的key数组
  const finalReducerKeys = Object.keys(finalReducers);

  // This is used to make sure we don't warn about the same
  // keys multiple times.
  let unexpectedKeyCache;
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {};
  }

  let shapeAssertionError;
  try {
    // 校验这个reducer
    // 其主要作用就是确保你的 reducer 是规范的
    // 确保 Action不匹配 或者 没有initState 的情况下仍然返回默认state，而不是undefined
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  // 返回合并后的function， 即为 createstore 中的第一个参数reducer 既 currentReducer
  // 接收两个参数，currentReducer(currentState, action)
  return function combination(state = {}, action) {
    // reducer不规范报错
    if (shapeAssertionError) {
      throw shapeAssertionError;
    }

    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      );
      if (warningMessage) {
        warning(warningMessage);
      }
    }

    let hasChanged = false;
    const nextState = {};
    for (let i = 0; i < finalReducerKeys.length; i++) {
      // 获取finalReducerKeys的key和value（function）
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];

      // 当前key的state值
      const previousStateForKey = state[key];
      // 执行reducer， 返回当前state
      const nextStateForKey = reducer(previousStateForKey, action);
      // 不存在返回值报错
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      // 新的state放在nextState对应的key里
      nextState[key] = nextStateForKey;
      //只有所有的 nextStateForKey 均与 previousStateForKey 相等时，hasChanged 的值才是 false
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    hasChanged =
      hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    //state 没有改变时，返回原对象
    return hasChanged ? nextState : state;
  };
}
/*
 *  新版本的redux这部分改变了实现方法
 *  老版本的redux使用的reduce函数实现的
 *  简单例子如下
 * function combineReducers(reducers) {
 *    return (state = {}, action) => {
 *        return Object.keys(reducers).reduce((currentState, key) => {
 *            currentState[key] = reducers[key](state[key], action);
 *             return currentState;
 *         }, {})
 *      };
 *    }
 *
 * */

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ];
    case 'COMPLETE_TODO':
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: true
          });
        }
        return todo;
      });
    default:
      return state;
  }
}

// function todos2(state = [], action) {
//   switch (action.type) {
//     case 'ADD_TODO':
//       return [
//         ...state,
//         {
//           text: action.text,
//           completed: false
//         }
//       ];
//     case 'COMPLETE_TODO':
//       return state.map((todo, index) => {
//         if (index === action.index) {
//           return Object.assign({}, todo, {
//             completed: true
//           });
//         }
//         return todo;
//       });
//     default:
//       return state;
//   }
// }

// function combineReducers1(reducers) {
//   return (state = {}, action) => {
//     return Object.keys(reducers).reduce((currentState, key) => {
//       currentState[key] = reducers[key](state[key], action);
//       return currentState;
//     }, {});
//   };
// }
// let reduce1 = combineReducers1({
//   todos,
//   todos2
// });
// console.log(reduce1);
