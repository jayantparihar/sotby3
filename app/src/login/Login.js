import React from 'react'
import { useState } from 'react'
import { ReactSession } from 'react-client-session';
import Header from "./components/Header";
import Button from '@material-ui/core/Button';
import { Typography } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { styled } from '@mui/system';
import { createTheme } from "@mui/material";

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
    minHeight: "200px",
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

function LoginButton() {
    const classes = buttonStyles();
    return <Button className={classes.button} type="submit">Login</Button>
}

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const authenticate = async (e) => {
        let res_data = {};

        e.preventDefault()

        const user = { username: username, password: password };
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        };

        await fetch('http://localhost:3000/login', requestOptions)
            .then(response => response.json())
            .then(data => res_data = data);

        console.log(res_data.status);
        if (res_data.status === 200) {
            ReactSession.set("username", res_data.username);
            ReactSession.set("first_name", res_data.first_name);
            ReactSession.set("last_name", res_data.last_name);
            ReactSession.set("admin", res_data.admin);
            window.location.href = "/";
        } else {
            document.getElementById("successMessage").innerText = "Incorrect username or password!"
        }

    }

    return (
        <Container>
            {/* <AdminNav /> */}
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
                    <Form onSubmit={authenticate}>
                        <text id="username-text">Username</text>
                        <input
                            className="login-input"
                            type="text"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} /><br />
                        <text id="password-text">Password</text>
                        <input
                            className="login-input"
                            type="password"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} /><br />
                        <LoginButton />
                        <div id="successMessage"></div>
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
                        SoTby is a web application for instructors at BCIT Automotive Department
                        to schedule classes, book resources, and manage vacations.
                    </Typography>
                </TextWrapper>
            </Wrapper>
        </Container>
    );
}

export default Login