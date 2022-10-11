import React from 'react'
import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { styled } from '@mui/system';
import Button from "@material-ui/core/Button";
import { ReactSession } from "react-client-session";

const Form = styled('form')({
})

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

function SubmitButton() {
    const classes = buttonStyles();
    return <Button className={classes.button} type="submit">Submit</Button>
}

const UserInfo = ({ onAdd }) => {

    const [first, setFirst] = useState('')
    const [last, setLast] = useState('')
    const [emp, setEmp] = useState('')
    const [ext, setExt] = useState('')

    const submit = (e) => {
        e.preventDefault()
        // makeusername function
        onAdd(ReactSession.get("username"))
        setFirst('')
        setLast('')
        setEmp('')
        setExt('')
    }

    return (
        <Form onSubmit={submit}>
            <SubmitButton />
        </Form>
    )
}

export default UserInfo