import React from 'react'
import { useState } from 'react'
import { ReactSession } from 'react-client-session';
import './create_course.css'
import Header from "./components/Header";
import DatePicker from "react-datepicker";
import Button from '@material-ui/core/Button';
import { Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { styled } from '@mui/system';
import { createTheme } from "@mui/material";
import "react-datepicker/dist/react-datepicker.css";

const screenLayout = createTheme({
    breakpoints: {
        values: {
            xxs: 0,
            xs: 300,
            lg: 800,
        }
    }
});

const buttonStyles = makeStyles({
    button: {
        border: 0,
        borderRadius: 5,
        color: "white",
        padding: '0 10px',
        background: "#003E6B",
        '&:hover': {
            background: "#5082A7",
        },
        '&:focus': {
            background: "#003E6B",
            '&:hover': {
                background: "#5082A7"
            }
        },
        marginTop: 10,
        marginBottom: 10
    }
});

const Container = styled('div')({
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "darkslategray",
    backgroundColor: "white"
})

const Wrapper = styled('div')({
    width: "75%",
    height: "50%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    margin: "30px auto",
    minHeight: "350px",
    border: "1px solid steelblue",
    padding: "30px",
    borderRadius: "5px",
    textAlign: "left",
})

const Form = styled('form')({
    width: "50%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
})

const Formwarpper = styled('div')({
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
})

const TextWrapper = styled('div')({
    width: "100%",
    height: "100%",
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "darkslategray",
    backgroundColor: "white",
})

function SubmitButton() {
    const classes = buttonStyles();
    return <Button className={classes.button} type="submit">Create</Button>
}

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
    const [course, setCourse] = useState('');
    const [title, setTitle] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const create_course = (e) => {
        e.preventDefault();

        if (!course_num || isNaN(course_num)) {
            document.getElementById("successMessage").innerText = "Please enter a valid course number.";
            return;
        }

        if (!subject) {
            document.getElementById("successMessage").innerText = "Please enter the subject.";
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

        // feedback upon successful creation
        socket.on('courseAdded1', (user) => {
            document.getElementById("successMessage").innerText = "Course successfully created."
        });

        // displays error msg upon failure 
        socket.on('error', (error) => {
            document.getElementById("successMessage").innerText = "An error has occured! Please check your inputs.";

        });
    }

    return isAdmin() ? (
        <Container>
            <Header />
            <Wrapper theme={screenLayout} sx={{
                flexDirection: {
                    xxs: "column",
                    xs: "column",
                    lg: "row",
                }
            }}
            >
                <Formwarpper>
                    <Form onSubmit={create_course}>
                        <text id='course-number'>Course Number</text>
                        <input
                            className="new-course-input"
                            type="text"
                            placeholder="Course Number: ..."
                            value={course_num}
                            onChange={(e) => setCourseNum(e.target.value)} />
                        <text id='subject-text'>Subject</text>
                        <input
                            className="new-course-input"
                            type="text"
                            placeholder="Subject..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)} />
                        <text id='title-text'>Title</text>
                        <input
                            className="new-course-input"
                            type="text"
                            placeholder="Title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)} />
                        <text id='start-and-end'>Duration</text>
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => {
                                setDateRange(update);
                            }}
                        />
                        <SubmitButton />
                        <p id="successMessage"></p>
                    </Form>
                </Formwarpper>
                <TextWrapper theme={screenLayout} sx={{
                    display: {
                        xxs: "none",
                        xs: "none",
                        lg: "flex",
                    }
                }}>
                    <Typography>
                        Use this form to create a course. The course number must be an integer. The subject
                        and title can be anything.
                    </Typography>
                </TextWrapper>
            </Wrapper>
        </Container>
    ) : window.location.href = "/"
}

export default Create_Course