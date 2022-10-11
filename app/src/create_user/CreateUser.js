import React from 'react'
import { useState } from 'react'
import { ReactSession } from 'react-client-session';
import './create_user.css'
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
    minHeight: "500px",
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

const UserInputWrapper = styled('div')({

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

function Create_User(socket) {
    socket = socket.socket;
    const [username, setUsername] = useState('');
    const [firstname, setFirstName] = useState('');
    const [lastname, setLastName] = useState('');
    const [admin, setAdmin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const create_user = (e) => {
        e.preventDefault();

        if (!username) {
            document.getElementById("successMessage").innerText = "Please enter a user name.";
            return;
        }

        if (!firstname || !lastname) {
            document.getElementById("successMessage").innerText = "Please enter a first and last name.";
            return;
        }

        if (!email) {
            document.getElementById("successMessage").innerText = "Please enter an email address.";
            return;
        }

        if (password !== confirmPassword) {
            document.getElementById("successMessage").innerText = "Password does not match confirmed password.";
            return;
        }

        const date = new Date();
        const dateJoined = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

        const new_user = {
            username: username,
            firstname: firstname,
            lastname: lastname,
            datejoined: dateJoined,
            admin: admin ? 1 : 0,
            email: email,
            password: password
        };
        socket.emit('userAdded', new_user, null);

        // feedback upon successful creation
        socket.on('userAdded', (user) => {
            document.getElementById("successMessage").innerText = "User successfully created."
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
                    <Form onSubmit={create_user}>
                        <text id='username-text'>Username</text>
                        <input
                            className="new-user-input"
                            type="text"
                            placeholder="FirstName_LastName"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} />
                        <text id='firstname-text'>First name</text>
                        <input
                            className="new-user-input"
                            type="text"
                            placeholder="First name..."
                            value={firstname}
                            onChange={(e) => setFirstName(e.target.value)} />
                        <text id='lastname-text'>Last name</text>
                        <input
                            className="new-user-input"
                            type="text"
                            placeholder="Last name..."
                            value={lastname}
                            onChange={(e) => setLastName(e.target.value)} />
                        <text id='admin-toggle'>Admin</text>
                        <input
                            className="new-user-input"
                            type="checkbox"
                            value={admin}
                            onChange={(e) => setAdmin(e.target.checked)} />
                        <text id='email-address'>Email</text>
                        <input
                            className="new-user-input"
                            type="text"
                            placeholder="Email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} />
                        <text id='password-text'>Password</text>
                        <input
                            className="new-user-input"
                            type="password"
                            placeholder="Password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} />
                        <text id='password-confirm'>Confirm password</text>
                        <input
                            classname="new-user-input"
                            type="password"
                            placeholder="Confirm password..."
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} />

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
                        Use this form to create a new user. User names should be in the format of firstname_lastname.
                        If you leave the 'admin' box unchecked, you will create a normal user.
                    </Typography>
                </TextWrapper>
            </Wrapper>
        </Container>
    ) : window.location.href = "/";

}

export default Create_User