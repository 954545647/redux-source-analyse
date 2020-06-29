import compose from './compose';

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
export default function applyMiddleware(...middlewares) {
  return (createStore) => (...args) => {
    // 这里再一次调用 createStore，并且传入 args
    // 相当于 createStore(reducer, initstate)，如果有传 preloadedState 的话
    const store = createStore(...args);

    // 定义了一个dispatch， 调用会 throw new Error
    let dispatch = () => {
      // 不允许在构建中间件时进行调度
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      );
    };

    // 构建 middlewareAPI对象，传入每一个中间件中
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    };
    // 每一个middleware的形式如  store => next => action => {}
    // middlewareAPI 当作参数 store 传入到 middleware 中
    const chain = middlewares.map((middleware) => middleware(middlewareAPI));

    // compose(...chain)会形成一个调用链
    // next指代下一个函数的注册, 这就是中间件的返回值要是 next(action) 的原因
    dispatch = compose(...chain)(store.dispatch);
    // 上面代码演变成：
    // applyMiddleware(logger1, logger2, logger3)
    // applyMiddleware(logger1(middlewareAPI), logger2(middlewareAPI), logger3(middlewareAPI))
    // dispatch = log1(log2(log3(store.dispatch)))
    // 传递给 log3 的 next 是 执行 const store = createStore(...args) 后返回 store 中的 dispatch 方法, 函数log3 返回 l3
    // 传递给 log2 的 next 是 l3，log2 返回 l2
    // 传递给 log1 的 next 是 l2，log1 返回 l1
    // 所以最终的 dispatch 就是 l1

    // 当发生调用的时候，传递 action 到 dispath 的时候，即执行 l1(action)
    // 会以类似洋葱模型的方式，先去获得最外层方法的值
    // 会依次执行 l2(action)，l3(action)，store.dispatch(action)，最后 l1(action)

    // 增强 store 返回的 action
    return {
      ...store,
      dispatch
    };
  };
}
