import React from 'react'
import { useState } from 'react'
import { ReactSession } from 'react-client-session';
import './create_resource.css'
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

function Create_resource(socket) {
    socket = socket.socket;
    const [model_num, setModelNum] = useState('');
    const [model_name, setModelName] = useState('');
    const [quantity_total, setQuantityTotal] = useState('');
    const [model_location, setModelLocation] = useState('');

    const create_resource = (e) => {
        e.preventDefault();

        if (!model_num) {
            document.getElementById("successMessage").innerText = "Please enter a model number.";
            return;
        }

        if (!model_name) {
            document.getElementById("successMessage").innerText = "Please enter a model name.";
            return;
        }

        if (!quantity_total || isNaN(quantity_total) || quantity_total <= 0) {
            document.getElementById("successMessage").innerText = "Please enter a valid quantity";
            return;
        }

        if (!model_location) {
            document.getElementById("successMessage").innerText = "Please enter a model location.";
            return;
        }

        const new_resource = {
            model_num: model_num,
            model_name: model_name,
            quantity_total: quantity_total,
            model_location: model_location
        };
        socket.emit('resourceAdded', new_resource, null);

        // feedback upon successful creation
        socket.on('resourceAdded', (user) => {
            document.getElementById("successMessage").innerText = "Resource successfully created."
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
                    <Form onSubmit={create_resource}>

                        <text id='model-number'>Model Number</text>
                        <input
                            className="new-resource-input"
                            type="text"
                            placeholder="Model Number..."
                            value={model_num}
                            onChange={(e) => setModelNum(e.target.value)} />
                        <text id='model-name-text'>Model Name</text>
                        <input
                            className="new-resource-input"
                            type="text"
                            placeholder="Model Name..."
                            value={model_name}
                            onChange={(e) => setModelName(e.target.value)} />
                        <text id='quantity-number'>Quantity Total</text>
                        <input
                            className="new-resource-input"
                            type="text"
                            placeholder="Quantity Total..."
                            value={quantity_total}
                            onChange={(e) => setQuantityTotal(e.target.value)} />
                        <text id='model-location-text'>Model Location</text>
                        <input
                            className="new-resource-input"
                            type="text"
                            placeholder="Model Location..."
                            value={model_location}
                            onChange={(e) => setModelLocation(e.target.value)} />

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
                        Use this form to create a resource that can booked for use. Quantity should be a
                        positive number. Location should be the actual physical location of the resource,
                        such as a BCIT campus.
                    </Typography>
                </TextWrapper>
            </Wrapper>
        </Container>
    ) : window.location.href = "/"
}

export default Create_resource