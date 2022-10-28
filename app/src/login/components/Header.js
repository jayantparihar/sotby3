import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { styled } from '@mui/system';
import React, { Component }  from 'react';

const styles = makeStyles({
    button: {
        border: 0,
        borderRadius: 5,
        color: "white",
        padding: '0 10px',
        background: "#003E6B",
        width: "8vw",
        alignSelf: "center",
        '&:hover': {
            background: "#5082A7",
        },
        '&:focus': {
            background: "#003E6B",
            '&:hover': {
                background: "#5082A7"
            }
        },
        textAlign: "right",
        marginLeft: "30%",
    },
    image: {
        width: 80,
        height: 80,
    }
});

function Logo() {
    const classes = styles();
    return <img className={classes.image} src={require("../../images/BCIT_logo.png")}
        alt={"BCIT"} style={{
            position: "absolute",
            left: 5,
            top: 5,
        }} />
}

function BackButton() {
    const classes = styles();
    return <Button className={classes.button} onClick={(e) => { window.location.href = '/' }}>Back</Button>
}

const TopNavWrapper = styled('div')({
    width: "100vw",
    height: "10vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    justifyContent: "space-evenly",
    color: "#003E6B",
    backgroundColor: "white",
})

const LoginAndBackBWrapper = styled('div')({
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
})

const LoginTitleWrapper = styled('div')({
})

const Header = ({ title }) => {
    return (
        <TopNavWrapper>
            <Logo />
            <LoginAndBackBWrapper>
                <LoginTitleWrapper>
                    <h1 className="login-title">{title}</h1>
                </LoginTitleWrapper>
                <BackButton />
            </LoginAndBackBWrapper>
        </TopNavWrapper>
    );
};

Header.defaultProps = {
    title: 'Login',
}

export default Header;
