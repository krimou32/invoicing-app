import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import * as firebase from 'firebase'
import JobStartSnackBar from './JobStartSnackBar.js'
import JobStopSnackBar from './JobStopSnackBar.js'

class TaskForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            start: '',
            finish: '',
            duration: '',
            rate: 0.00,
            task: '',
            working: false,
            timer: null,
            counter: 0,
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
        const entriesRef = this.props.database.ref('entries')
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
      storeNewEntry = (newEntry) => { this.props.database.ref().child('entries').push(newEntry) }
    
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

      // Set the right values for hours, minutes and seconds
      let hours = Math.floor(this.state.counter / 60 / 60)
      let minutes = Math.floor(this.state.counter / 60)
      let seconds = this.state.counter < 60 ? this.state.counter : this.state.counter % 60
      
      return(
        <div className="col-xs-12 col-md-3">
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
          <Button variant="raised" color={this.state.working ? 'secondary' : 'primary'} onClick={this.setTimer}>
            {this.state.working ? 'Stop' : 'Start'}
          </Button>
          <JobStartSnackBar working={this.state.working} />
          <JobStopSnackBar working={this.state.working} />

          <div className="timer">
            {hours}:{minutes}:{seconds}
          </div>
        </div>
      )
    }
}

export default TaskForm