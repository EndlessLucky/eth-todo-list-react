import React, { Component } from 'react'
import Web3 from 'web3';
import './App.css';
import { TODO_LIST_ABI, TODO_LIST_ADDRESS } from './config';
import TodoList from './TodoList';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      account: '',
      taskCount: 0,
      tasks: [],
      loading: true
    };
    this.createTask = this.createTask.bind(this);
    this.toggleCompleted = this.toggleCompleted.bind(this);
  }

  componentWillMount() {
    this.loadBlockchainData();
  } 

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const todoList = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS);
    this.setState({ todoList });
    const taskCount = await todoList.methods.taskCount().call();
    this.setState({ taskCount });
    for(var i = 1; i <= taskCount; i++){
      const task = await todoList.methods.tasks(i).call();
      this.setState({
        tasks: [...this.state.tasks, task]
      })
    }
    this.setState({ loading: false });
  }  

  createTask(content) {
    this.setState({ loading: true })
    this.state.todoList.methods.createTask(content).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  toggleCompleted(taskId) {
    this.setState({ loading: true })
    this.state.todoList.methods.toggleCompleted(taskId).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <main role="main" className="col-lg-12 d-flex justify-content-center">
        { this.state.loading
          ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
          : <TodoList tasks={this.state.tasks} createTask={this.createTask} />
        }
      </main>
    );
  }  
}

export default App;
