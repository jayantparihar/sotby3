import { createTheme, Typography } from "@mui/material";
import { styled } from "@mui/system";
import Button from "@material-ui/core/Button";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { makeStyles } from "@material-ui/core/styles";
import React, { Component }  from 'react';

const screenLayout = createTheme({
  breakpoints: {
    values: {
      xxs: 0,
      xs: 460,
      lg: 800,
    }
  }
})

const CheckAndCancelStyles = makeStyles({
  check: {
    border: 0,
    borderRadius: 5,
    color: "white",
    padding: '0 10px',
    background: "green",
    '&:hover': {
      background: "white",
      color: "green",
    },
    '&:focus': {
      background: "green",
      color: "green",
    },
  },
  cancel: {
    border: 0,
    borderRadius: 5,
    color: "white",
    padding: '0 10px',
    background: "red",
    '&:hover': {
      background: "white",
      color: "red",
    },
    '&:focus': {
      background: "green",
      color: "red",
    },
  }
});

const VacationInfoWrapper = styled('div')({
  padding: "5px",
  width: "50%",
});

const ButtonsWrapper = styled('div')({
  padding: "5px",
  width: "50%",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center"
})

const Container = styled('div')({
  border: "1px solid",
  borderColor: "steelblue",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "20px",
})

const VacationEntry = ({ vacation, name, onApprove, onReject }) => {

  const numToMonth = (num) => {
    switch (num) {
      case 0:
        return "January"
      case 1:
        return "February"
      case 2:
        return "March"
      case 3:
        return "April"
      case 4:
        return "May"
      case 5:
        return "June"
      case 6:
        return "July"
      case 7:
        return "August"
      case 8:
        return "September"
      case 9:
        return "October"
      case 10:
        return "November"
      case 11:
        return "December"
    }
  }

  const createDate = (timestamp) => {
    const date = new Date(timestamp)
    const month = numToMonth(date.getMonth())
    return date.getDate() + " " + month + ", " + date.getFullYear()
  }

  return (
    <Container theme={screenLayout} sx={{
      width: {
        xxs: "100%",
        xs: "100%",
        lg: "500px",
      }
    }}>
      <VacationInfoWrapper theme={screenLayout} sx={{
        width: {
          xxs: "70%",
          xs: "70%",
          lg: "50%",
        },
      }}>
        <Typography theme={screenLayout} sx={{
          fontSize: {
            xxs: "15px",
            xs: "15px",
            lg: "24px",
          },
        }}>
          <div className="approval-entry-name" style={{ fontWeight: "bold" }}>{name[0]} {name[1]}</div>
          <div className="approval-entry-start">From: {createDate(vacation.start_date)}</div> {/* BLANK CHARACTER 52-54 */}
          <div className="approval-entry-end">To: {createDate(vacation.end_date)}</div> {/* BLANK CHARACTER 48-50 */}
          <div className="approval-entry-duration">Duration: {vacation.duration} days</div>
        </Typography>
      </VacationInfoWrapper>
      <ButtonsWrapper>
        <Button onClick={() => onApprove(vacation)} className={CheckAndCancelStyles().check}><CheckCircleIcon /></Button>
        <Button onClick={() => onReject(vacation)} className={CheckAndCancelStyles().cancel}><CancelIcon /></Button>
      </ButtonsWrapper>
    </Container>
  )
}

export default VacationEntry
