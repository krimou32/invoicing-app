import React, { Component } from 'react'
import * as firebase from 'firebase'
import { DB_CONFIG } from './firebaseConfig'
import Button from '@material-ui/core/Button'
import FullCalendar from 'fullcalendar-reactwrapper'
import 'fullcalendar-reactwrapper/dist/css/fullcalendar.min.css'
import './App.css'

// Initialize firebase app and store ref to DB
firebase.initializeApp(DB_CONFIG)
const database = firebase.database()

// Authenticate to DB anonymously and log error if any
firebase.auth().signInAnonymously().catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;

  alert('Error' + errorCode + ':' + errorMessage)
});

class App extends Component {
  constructor() {
    super()
    // Setting initial state: No task, not working
    this.state = {
      start: '',
      finish: '',
      duration: '',
      rate: 0.00,
      task: '',
      working: false,
      timer: null,
      counter: 0,
      events: []
    }

    this.updateTask = this.updateTask.bind(this)
    this.updateRate = this.updateRate.bind(this)
    this.setTimer = this.setTimer.bind(this)
    this.tick = this.tick.bind(this)
  }

  componentDidMount() {
    let events = []

    let formatDate = (date) => {
      let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      let monthIndex = date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      let year = date.getFullYear()
      let hours = date.getHours()
      let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()

      return year + '-' + monthIndex + '-' + day + 'T' + hours + ':' + minutes + ':00'
    }

    // Retrieve data from DB and construct events array
    const gotData = (data) => {
      let entries = data.val()
      let events = []

      for (let item in entries) {
        let start = new Date(entries[item].start)
        let end = new Date(entries[item].finish)
        let task = entries[item].task

        events.push({
          title: task,
          start: formatDate(start),
          end: formatDate(end)
        })
      }

      console.log(events)
      this.setState({ events: events})
    }

    // Log error if any
    const errData = (err) => {
      console.log('Arrr Error!')
      console.log(err)
    }

    // Retrieve entries in real time from DB
    const entriesRef = database.ref('entries')
    entriesRef.on('value', gotData, errData)
  }

  // Increment timer by 1
  tick = () => {
    let now = Date.now()
    this.setState({
      counter: Math.floor((now - this.state.start) / 1000)
    })
  }

  // When a new task is typed in the input, it will update the state
  updateTask = (event) => { this.setState({ task: event.target.value }) }

  // When a new task is typed in the input, it will update the state
  updateRate = (event) => { this.setState({ rate: event.target.value }) }

  // Send newEntry data to DB
  storeNewEntry = (newEntry) => { database.ref().child('entries').push(newEntry) }

  // If not working: Save the current time stamp as the start date in state and change the working status to true
  /*
  If working: Save the current timestamp as the finish date in state and change 
  the working status to false.
  
  Then store the current state except the working status in a new object newEntry.

  Then send the newEntry to the firebase DB to store it.
  */
  setTimer = () => {
    // Usually the initial state, when 'Start' is pressed it stores the current date stamp in the state.
    // It also changes the working state to true.
    if (!this.state.working) {
      const startTime = Date.now()
      this.setState({
        start: startTime,
        working: true
      })

      // Start timer
      let timer = setInterval(this.tick, 500)
      this.setState({timer})
      
    // This is fired when 'Stop' is pressed. It store the current date stamp in the state.
    // It also changes the working state to false.
    // Then it calculates the work duration and stores it in the DB along with other task info.
    } else {
      const endTime = Date.now()
      const duration = endTime - this.state.start
      this.setState({
      finish: endTime,
      duration: duration,
      working: false,
      timer: null,
      counter: 0
    })

    // Clear the timer's interval
    clearInterval(this.state.timer)

    // Send data to DB
    this.storeNewEntry({
      task: this.state.task,
      start: this.state.start,
      finish: endTime,
      duration: duration,
      rate: this.state.rate
    })
  }
}

  render() {

    // If working is true set toggleTimer to 'Stop', otherwise set it to 'Start'.
    let toggleStartStop = this.state.working ? 'Stop' : 'Start'
    let startStopButtonColor = this.state.working ? 'secondary' : 'primary'

    // Set the right values for hours, minutes and seconds
    let hours = Math.floor(this.state.counter / 60 / 60)
    let minutes = Math.floor(this.state.counter / 60)
    let seconds = this.state.counter < 60 ? this.state.counter : this.state.counter % 60

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h1>Invoicing App</h1>
          </div>
        </div>
        
        <div className="row">
          <div className="col-3">
            <div className="newTaskForm">
              <label>
                <p>What are you working on?</p>
                <input type="text" value={this.state.task} onChange={this.updateTask} />
              </label>

              <label>
                <p>How much do you charge per hour?</p>
                <span className="currencyInputLeft">£</span><input type="number" value={this.state.rate} onChange={this.updateRate} /><span className="currencyInputRight">/hour</span>
              </label>
            </div>
            <Button className="btn-mui" variant="raised" color={startStopButtonColor} className="startStopBtn" onClick={this.setTimer}>
              {toggleStartStop}
            </Button>

            <div className="timer">
              {hours}:{minutes}:{seconds}
            </div>
          </div>
        
          <div className="col-9 calendar">
            <FullCalendar
            id = "tasksCalendar"
            header = {{
                left: 'prev,next today myCustomButton',
                center: 'title',
                right: 'month,basicWeek,basicDay'
            }}
            navLinks= {true} // can click day/week names to navigate views
            editable= {false}
            eventLimit= {true} // allow "more" link when too many events
            events = {this.state.events}
            defaultView = 'agendaWeek'
            timeFormat = 'H:mm'
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
