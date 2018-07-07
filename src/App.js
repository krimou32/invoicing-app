import React, { Component } from 'react'
import TaskForm from './Components/TaskForm.js'
import Calendar from './Components/Calendar.js'
import * as firebase from 'firebase'
import { DB_CONFIG } from './firebaseConfig'
import './App.css'

// Initialize firebase app
firebase.initializeApp(DB_CONFIG)
const database = firebase.database()

// Authenticate to DB anonymously and log error if any
firebase.auth().signInAnonymously().catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;

  alert('Error' + errorCode + ':' + errorMessage)
})

class App extends Component {
  constructor(props) {
    super(props)
    // Setting initial state: No task, not working
    this.state = {
      db: firebase.database()
    }
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h1>Invoicing App</h1>
          </div>
        </div>
        
        <div className="row">

        <TaskForm database={database} />
        <Calendar database={database} />  
        
        </div>
      </div>
    );
  }
}

export default App;
