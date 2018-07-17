import React, { Component } from 'react'
import * as firebase from 'firebase'
import FullCalendar from 'fullcalendar-reactwrapper'
import 'fullcalendar-reactwrapper/dist/css/fullcalendar.min.css'

class Calendar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            events: [],
        }
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

    render() {
        return(
            <div className="col-xs-12 col-md-9 calendar">
                <FullCalendar
                id = "tasksCalendar"
                header = {{
                    left: 'prev,next today myCustomButton',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay'
                }}
                navLinks= {true} // can click day/week names to navigate views
                editable= {false}
                eventLimit= {true} // allow "more" link when too many events
                events = {this.state.events}
                defaultView = 'agendaWeek'
                timeFormat = 'H:mm'
                />
            </div>
        )
    }
}

export default Calendar