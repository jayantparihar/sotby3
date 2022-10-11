import Vacation from "./vacation-form/Vacation"
import Schedule from "./Schedule"
import DetailedSchedule from "./detailed-schedule/detailedSchedule"
import Resources from "./resources/resources"
import Login from "./login/Login"
import CreateUser from "./create_user/CreateUser"
import CreateCourse from "./course/CreateCourse"
import CreateResource from "./resources/create_resource"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { ReactSession } from 'react-client-session';
import VacationApproval from "./vacation-approval/VacationApproval";
import io from "socket.io-client";
import React, { Component }  from 'react';
const socket = io.connect('/');

ReactSession.setStoreType("localStorage");

function App() {
    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route exact path="/" element={<Schedule socket={socket} />} />
                    <Route exact path="/detailed-schedule" element={<DetailedSchedule socket={socket} />} />
                    <Route exact path="/resources" element={<Resources socket={socket} />} />
                    <Route exact path="/vacation" element={<Vacation socket={socket} />} />
                    <Route exact path="/vacationApproval" element={<VacationApproval socket={socket} />} />
                    <Route exact path="/login" element={<Login />} />
                    <Route exact path="/create_user" element={<CreateUser socket={socket} />} />
                    <Route exact path="/create_course" element={<CreateCourse socket={socket} />} />
                    <Route exact path="/create_resource" element={<CreateResource socket={socket} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
