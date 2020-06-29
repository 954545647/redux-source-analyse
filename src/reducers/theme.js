import { CHANGE_COLOR } from '../constants';
export default function theme(state = { color: 'blue' }, action) {
  console.log(action);

  switch (action.type) {
    case CHANGE_COLOR:
      return {
        ...state,
        color: action.color
      };
    default:
      return state;
  }
}
