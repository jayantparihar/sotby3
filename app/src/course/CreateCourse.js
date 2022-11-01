import React from 'react'
import { useState } from 'react'
import { ReactSession } from 'react-client-session';
import styles from './create_course.module.css'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AdminNav from "../../src/components/AdminNav";
import { Link } from 'react-router-dom'
import logo from '../images/BCIT_logo.png'


function isAdmin() {
    let userStatus = ReactSession.get("admin");
    if (userStatus === 1) {
        return true;
    }
    return false;
}

function Create_Course(socket) {
    socket = socket.socket;
    const [course_num, setCourseNum] = useState('');
    const [subject, setSubject] = useState('');
    // const [course, setCourse] = useState('');
    const [title, setTitle] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const create_course = (e) => {
        e.preventDefault();
        document.getElementById("successMessage").style.color = 'Red';
        document.getElementById("successMessage").style.fontWeight= 'Bold';
        if (!course_num || isNaN(course_num)) {
            document.getElementById("successMessage").innerText = "Please enter a valid course number.It should be a Integer Value.";
            return;
        }

        if (!subject) {
            document.getElementById("successMessage").innerText = "Please enter the subject name.";
            return;
        }

        if (!title) {
            document.getElementById("successMessage").innerText = "Please enter the course title.";
            return;
        }

        if (!dateRange[0] || !dateRange[1]) {
            document.getElementById("successMessage").innerText = "Please enter a start and end date.";
            return;
        }

        const new_course = {
            course_num: course_num,
            subject: subject,
            course: course_num,
            title: title,
            start_date: `${dateRange[0].getFullYear()}-${dateRange[0].getMonth() + 1}-${dateRange[0].getDate()}`,
            end_date: `${dateRange[1].getFullYear()}-${dateRange[1].getMonth() + 1}-${dateRange[1].getDate()}`,
            colour: ""
        };
        socket.emit('courseAdded1', new_course);
        console.log('CreateCourse.js\tcourse_created!')
        // feedback upon successful creation
        socket.on('courseAdded1', (user) => {
            document.getElementById("successMessage").innerText = "Course successfully created."
            document.getElementById("successMessage").style.color = 'Green';
            document.getElementById("successMessage").style.fontWeight= 'Bold';
        });

        // displays error msg upon failure 
        socket.on('error', (error) => {
            document.getElementById("successMessage").innerText = "An error has occured! Please check your inputs.";
            document.getElementById("successMessage").style.color = 'Red';
            document.getElementById("successMessage").style.fontWeight= 'Bold';

        });
    }

    return isAdmin() ? (
        <>
        <AdminNav></AdminNav>
        <label><br/></label>
        <div align="center">
            <Link to="/"><img src={logo} alt='logo' height="150" width="170" ></img></Link>
            </div>
        <form onSubmit={create_course} className={styles['course-form']}>
                        <h2>Create Course</h2>
        <label>
        <span>Course Number:</span>
        <input
                            className="new-course-input"
                            type="text"
                            placeholder="Course Number..."
                            value={course_num}
                            onChange={(e) => setCourseNum(e.target.value)} />
              </label>
        <label>
        <span>Subject Name:</span>
              <input
                            className="new-course-input"
                            type="text"
                            placeholder="Subject..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label>
        <span>Title:</span>
        <input
                            className="new-course-input"
                            type="text"
                            placeholder="Title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)} />
                            
        </label>
        <label>
        <text id='start-and-end'>Duration: </text>
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => {
                                setDateRange(update);
                            }}
                        />
        </label>
        <button >Create Course</button>
        <p id="successMessage"></p>
        </form>
        </> 
    ) : window.location.href = "/"
}
export default Create_Course