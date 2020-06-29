import * as Constants from '../constants';
export const decrement = (number) => ({
  type: Constants.DECREMENT,
  number
});

export const increment = (number) => ({
  type: Constants.INCREMENT,
  number
});

export const changeTheme = (color) => ({
  type: Constants.CHANGE_COLOR,
  color
});
