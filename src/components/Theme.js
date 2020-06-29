import React from 'react';
import { connect } from 'react-redux';
import { changeTheme } from '../actions';

function Theme(props) {
  const { color, changeColor } = props;
  console.log(changeColor);

  return (
    <div className="theme-wrapper">
      <span style={{ color: `${color}` }} className="theme-color">
        {color}
      </span>
      <button
        className="theme-btn-blue"
        onClick={() => {
          changeColor('blue');
        }}
      >
        Blue
      </button>
      <button
        onClick={() => {
          changeColor('red');
        }}
      >
        Red
      </button>
    </div>
  );
}

const mapStateToProps = (state) => ({
  color: state.theme.color
});

const mapDispatchToProps = (dispatch) => ({
  changeColor: (color) => {
    dispatch(changeTheme(color));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Theme);
