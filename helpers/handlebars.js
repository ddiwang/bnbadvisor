// helpers/handlebars.js

export function ifEquals(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  }
  
  export function range(from, to, options) {
    let accum = '';
    for (let i = from; i <= to; ++i) {
      accum += options.fn(i);
    }
    return accum;
  }