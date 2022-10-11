import React, { useState } from 'react';
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from '@mui/material/Select';
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import { styled } from "@mui/system";


function getBusinessDateCount(startDate, endDate) {
  let elapsed, daysAfterLastSunday;
  let ifThen = function (a, b, c) {
    return a == b ? c : a;
  };

  elapsed = endDate - startDate;
  elapsed /= 86400000;

  let daysBeforeFirstSunday = (7 - startDate.getDay()) % 7;
  daysAfterLastSunday = endDate.getDay();

  elapsed -= (daysBeforeFirstSunday + daysAfterLastSunday);
  elapsed = (elapsed / 7) * 5;
  elapsed += ifThen(daysBeforeFirstSunday - 1, -1, 0) + ifThen(daysAfterLastSunday, 6, 5);

  return Math.ceil(elapsed);
}

const UserInputContainer = styled('div')({
  display: "flex",
  flexDirection: "column",
  alignItems: "left",
})

const Form = styled('form')({

})

const VacationInput = ({ onAdd }) => {
  const [NC, setNC] = useState('');
  const [startingMonth, setStartingMonth] = useState('');
  const [startingDay, setStartingDay] = useState('');
  const [endingMonth, setEndingMonth] = useState('');
  const [endingDay, setEndingDay] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [VABT, setVABT] = useState('');
  const [notes, setNotes] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const styles = makeStyles({
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

  function AddButton() {
    const classes = styles();
    return <Button className={classes.button} type="submit">Add</Button>
  }

  const onSubmit = (e) => {
    e.preventDefault();

    onAdd({ NC, startingMonth, startingDay, endingMonth, endingDay, day, hour, VABT, notes });
    setNC('');
    setStartingMonth('');
    setStartingDay('');
    setEndingMonth('');
    setEndingDay('');
    setDay('');
    setHour('');
    setVABT('');
    setNotes('');
  }

  return (
    <UserInputContainer>
      <Form onSubmit={onSubmit}>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <InputLabel id="demo-simple-select-helper-label">NEW/CANCEL</InputLabel>
          <Select
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            label="NEW/CANCEL"
            onChange={(e) => setNC(e.target.value)}
          >
            <MenuItem value={"N"} style={{ width: "100%" }}>New</MenuItem>
            <MenuItem value={"C"} style={{ width: "100%" }}>Cancel</MenuItem>
          </Select>
        </FormControl><br />
        <text>Date</text>
        <DatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => {
            // doing it all at once seems to be a bit buggy. maybe add some logic
            setDateRange(update);
            setStartingMonth(`${update[0].getMonth() + 1}`);
            setStartingDay(update[0].getDate());
            setEndingMonth(`${update[1].getMonth() + 1}`);
            setEndingDay(update[1].getDate());
            const start = new Date(update[0]);
            const end = new Date(update[1]);

            // exclude weekends
            setDay(`${getBusinessDateCount(update[0], update[1])}`);
          }}
        />
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <InputLabel id="demo-simple-select-helper-label">VA/BT</InputLabel>
          <Select
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            label="VA/BT"
            onChange={(e) => setVABT(e.target.value)}
          >
            <MenuItem value={"VA"} style={{ width: "100%" }}>Vacation</MenuItem>
            <MenuItem value={"BT"} style={{ width: "100%" }}>Banked</MenuItem>
          </Select>
        </FormControl><br />
        <text>Notes on vacation</text><br />
        <input className="vacation-input-large" type="text" placeholder="..." value={notes} onChange={(e) => setNotes(e.target.value)} /><br />
        <AddButton />
      </Form>
    </UserInputContainer>
  );
};

export default VacationInput;
