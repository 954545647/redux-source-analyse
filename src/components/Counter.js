import React from 'react';
import { connect } from 'react-redux';
import { increment, decrement } from '../actions';

function Counter(props) {
  const { number, add, cut } = props;

  return (
    <div className="counter-wrapper">
      <span className="counter-num">{number}</span>
      <button
        className="counter-btn-add"
        onClick={() => {
          add(1);
        }}
      >
        add
      </button>
      <button
        onClick={() => {
          cut(1);
        }}
      >
        cut
      </button>
    </div>
  );
}

const mapStateToProps = (state) => ({
  number: state.counter.number
});

const mapDispatchToProps = (dispatch) => ({
  add: (num) => {
    dispatch(increment(num));
  },
  cut: (num) => {
    dispatch(decrement(num));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
