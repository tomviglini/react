import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';


let id = 0;

function todo(state = {}, action) {

  switch (action.type) {

    case 'ADD_TODO':
      return {
        title: action.title,
        finish: false,
        timer: 0,
        id: id++
      }
      break;

    case 'REMOVE_TODO':
      return state.id !== action.id ? state : null;
      break;

    case 'TOGGLE_TODO':
      return state.id !== action.id ? state : {...state, ...{ finish: !state.finish }};
      break;

    case 'START_TODO':
      return state.id !== action.id ? state : {...state, ...{ timer: action.timer }};
      break;

    case 'STOP_TODO':
      return state.id !== action.id ? state : {...state, ...{ timer: 0 }};
      break;

    default:
      return state;
  }

}

function todos(state = [], action) {

  switch (action.type) {

    case 'ADD_TODO':
      return [...state, todo(null, action)];
      break;

    case 'REMOVE_TODO':
      return state.filter(t => todo(t, action));
      break;

    case 'TOGGLE_TODO':
      return state.map(t => todo(t, action));
      break;

    case 'START_TODO':
      return state.map(t => todo(t, action));
      break;

    case 'STOP_TODO':
      return state.map(t => todo(t, action));
      break;

    default:
      return state;
  }

}


let todoStore = createStore(todos);

todoStore.subscribe((state) => {
  console.log('------------------------------------------------');
  todoStore.getState()
    .forEach(e => console.log(e));
});

class FormTodo extends React.Component {

    constructor(props) {
      super(props);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.changeField = this.changeField.bind(this);
      this.state = {
        title: ''
      };
    }

    changeField(evt) {
      let own = {};
      own[evt.target.id] = evt.target.value;
      this.setState(own);
    }

    handleSubmit(evt) {
      evt.preventDefault();
      if(this.state.title.trim() === '') return;
      todoStore.dispatch({type: 'ADD_TODO', title: this.state.title});
      this.setState({title: ''});
    }

    render() {
      return (
        <form onSubmit={this.handleSubmit}>
          <label>
            Title: <input type="text" id="title" value={this.state.title} onChange={this.changeField} />
          </label>
          <input type="submit" value="Add" />
        </form>
      )
    }

}


class TodoItem extends React.Component {

  constructor(props) {
    super(props);
    this.removeItem = this.removeItem.bind(this);
    this.toggleItem = this.toggleItem.bind(this);
    this.startItem = this.startItem.bind(this);
    this.stopItem = this.stopItem.bind(this);
  }

  removeItem() {
    todoStore.dispatch({type:'REMOVE_TODO', id: this.props.todo.id});
  }

  toggleItem() {
    todoStore.dispatch({type:'TOGGLE_TODO', id: this.props.todo.id});
  }

  startItem() {
    todoStore.dispatch({type:'START_TODO', id: this.props.todo.id, timer: this.getTime()});
  }

  stopItem() {
    todoStore.dispatch({type:'STOP_TODO', id: this.props.todo.id});
  }

  getTime() {
    return Math.round(new Date().getTime() / 1000);
  }

  render() {

    const itemStyle = {
      color: this.props.todo.finish === true ? '#000000' : '#ff0000',
      float: 'left',
      marginRight: '10px'
    };

    return (
      <div>
        <li onClick={this.toggleItem} style={itemStyle}>
          {this.props.todo.title}
        </li>
        <button onClick={this.removeItem}>Close</button>
        {this.props.todo.timer !== 0 ? 
          <button onClick={this.stopItem}>Stop</button> : 
          <button onClick={this.startItem}>Start</button>}
        <span>{(this.props.todo.timer !== 0 ? this.getTime() - this.props.todo.timer : null)}</span>
      </div>
    );

  }

}

class TodosList extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.intervalId = setInterval(() => this.forceUpdate(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    let list = '';
    return (
      <ul>
        {this.props.todos.map((t)=>{
          return <TodoItem key={t.id} todo={t} />
        })}
      </ul>
    );
  }

}

function Title(props) {
  return (
    <h1>{props.value}</h1>
  )
}

class App extends React.Component {

  render() {
    return (
      <div>
      <Title value="Tasks"/>
      <FormTodo />
      <TodosList todos={todoStore.getState()} />
      </div>
    );
  }

}

const appRender = () => render(<App />, document.getElementById('app'));

appRender();

todoStore.subscribe(() => appRender())
