import React from 'react';

class Cell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      selected: false,
      value: props.value,
    };

    this.display = this.determineDisplay({ x: props.x, y: props.y }, props.value);
    this.timer = 0;
    this.delay = 200;
    this.prevent = false;
  }

  componentDidMount() {
    window.document.addEventListener('unselectAll', this.handleUnselectAll);
  }

  componentWillUnmount() {
    window.document.removeEventListener('unselectAll', this.handleUnselectAll);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { value, editing, selected } = this.state;

    // Has a formula? May need to be updated.
    if (value && value[0] === '=') return true;

    // State or props changed, needs to update
    if (
      nextState.value !== value ||
      nextProps.value !== value ||
      nextState.editing !== editing ||
      nextState.selected !== selected
    )
      return true;

    return false;
  }

  // Before updating, execute the formula on the Cell value to calculate the
  // `display` value. Especially useful when a redraw is pushed upon this
  // cell when editing another cell that this might depend upon.
  UNSAFE_componentWillUpdate() {
    const { x, y } = this.props;

    this.display = this.determineDisplay({ x, y }, this.state.value);
  }

  onChange = evt => {
    const { x, y } = this.props;

    this.setState({ value: evt.target.value });

    this.display = this.determineDisplay({ x, y }, evt.target.value);
  };

  // Get key presses when editing as an input
  onKeyPressOnInput = evt => {
    if (evt.key === 'Enter') this.hasNewValue(evt.target.value);
  };

  // get keypresses when just a span
  onKeyPressOnSpan = evt => {
    if (!this.state.editing) this.setState({ editing: true });
  };

  onBlur = evt => {
    this.hasNewValue(evt.target.value);
  };

  handleUnselectAll = () => {
    if (this.state.selected || this.state.editing) {
      this.setState({ selected: false, editing: false });
    }
  };

  // Called by onBlur and onKeypressOnInput handlers to set a new value
  hasNewValue = value => {
    const { x, y } = this.props;

    this.props.onChangedValue({ x, y }, value);

    this.setState({ editing: false });
  };

  emitUnselectAllEvent = () => {
    const unselectAllEvent = new Event('unselectAll');
    window.document.dispatchEvent(unselectAllEvent);
  };

  clicked = () => {
    // Prevent click and double-click conflicting

    this.timer = setTimeout(() => {
      if (!this.prevent) {
        // Unselect all other cells and select this one
        this.emitUnselectAllEvent();
        this.setState({ selected: true });
      }

      this.prevent = false;
    }, this.delay);
  };

  doubleClicked = () => {
    // Prevent click and double-click conflicting
    clearTimeout(this.timer);

    this.prevent = true;

    // Unselect all other cells and select this one for editing
    this.emitUnselectAllEvent();
    this.setState({ selected: true, editing: true });
  };

  determineDisplay = ({ x, y }, value) => {
    if (value[0] === '=') {
      try {
        const res = this.props.executeFormula((x, y), value.substring(1));

        if (res.error && !this.state.editing) {
          console.error({ res });
          return '#INVALID';
        }

        return res.result;
      } catch (err) {
        console.error('Caught', err);
        return '#ERROR';
      }
    }

    return value;
  };

  setCSS = () => {
    const { x, y } = this.props;
    const { selected, editing } = this.state;

    const css = {
      border: '1px solid #cacaca',
      color: 'black',
      display: 'inline-block',
      fontFamily: "Calibri, 'Segoe UI', Thonburi, Arial, Verdana, sans-serif",
      fontSize: '1rem',
      height: '1.5rem',
      lineHeight: '1.1rem',
      margin: '0',
      overflow: 'hidden',
      padding: '0.25em',
      position: 'relative',
      textAlign: 'left',
      verticalAlign: 'top',
      width: '80px',
    };

    if (x === 0 || y === 0) {
      css.textAlign = 'center';
      css.backgroundColor = '#ffffa0';
      css.fontWeight = 'bold';
    }

    if (selected) {
      css.outlineColor = 'lightblue';
      css.outlineStyle = 'dotted';
    }

    if (editing) {
      css.outlineColor = 'blue';
      css.backgroundColor = '#e8ffff';
    } else if (!isNaN(parseInt(this.display, 10))) {
      css.textAlign = 'right';
    }

    return css;
  };

  render() {
    const { x, y } = this.props;
    const { editing, value } = this.state;

    const css = this.setCSS();

    if (x === 0) return <span style={css}>{y}</span>;

    if (y === 0) {
      const alpha = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

      return (
        <span style={css} onKeyPress={this.onKeyPressOnSpan} role="presentation">
          {alpha[x]}
        </span>
      );
    }

    if (editing) {
      return (
        <input
          style={css}
          type="text"
          onBlur={this.onBlur}
          onKeyPress={this.onKeyPressOnInput}
          value={value}
          onChange={this.onChange}
          autoFocus
        />
      );
    }

    return (
      <span
        style={css}
        onClick={evt => this.clicked(evt)}
        onDoubleClick={evt => this.doubleClicked(evt)}
        role="presentation"
      >
        {this.display}
      </span>
    );
  }
}

export default Cell;
