/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

// function Compose(...funcs) {
//   if (funcs.length === 0) {
//     return (args) => args;
//   }
//   if (funcs.length === 1) {
//     return funcs[0];
//   }
//   const arr = funcs;
//   let firstFun = arr[0];
//   let len = arr.length;
//   let i = 1;
//   while (i !== len) {
//     firstFun = firstFun(arr[i]);
//     i++;
//   }
//   return firstFun;
// }

export default function compose(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

// let x = 10;
// function fn1(x) {
//   return x + 1;
// }
// function fn2(x) {
//   return x + 2;
// }
// function fn3(x) {
//   return x + 3;
// }
// function fn4(x) {
//   return x + 4;
// }
// function compose1(...funcs) {
//   if (funcs.length === 0) {
//     return (arg) => arg;
//   }

//   if (funcs.length === 1) {
//     return funcs[0];
//   }

//   return funcs.reduce((a, b) => {
//     return (...args) => {
//       return a(b(...args));
//     };
//   });
// }
// let composeFn = compose1(fn1, fn2, fn3, fn4);
// console.log(composeFn(x));

// // 第一次
// // a:
// function fn1(x) {
//   return x + 1;
// }
// // b:
// function fn2(x) {
//   return x + 2;
// }
// return：
//  (...args)=>{
//    return fn1(fn2(...args))
//  }

// // 第二次
// // a:
// function a(...args) {
//   return fn1(fn2(...args));
// }
// // b:
// function fn3(x) {
//   return x + 3;
// }
// return：
//  (...args)=>{
//    return fn1(fn2(fn3(...args)));
//  }

// // 就是把整个 函数fn3 当作参数 args 传入到 a 中

// // 第三次
// // a:
// function a(...args) {
//   return fn1(fn2(fn3(...args)));
// }
// // b:
// function fn4(x) {
//   return x + 4;
// }
// return：
//  (...args)=>{
//    return fn1(fn2(fn3(fn4((...args)))));
//  }
