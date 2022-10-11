import React from "react";
import Month from './Month';
import { useState } from "react";
import NoCollisionLayout from './NoCollisionLayout';
import { ReactSession } from 'react-client-session';
import AdminNav from "./AdminNav";
import UserNav from "./UserNav";
import DefaultNav from "./DefaultNav";
import '../navbar.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import NoCollisionYear from './NoCollision_Year';
import MonthYear from './Month_Year';


function SelectNav(props) {
    const userStatus = props.userStatus;
    if (userStatus === 1) {
        return <AdminNav />
    }
    if (userStatus === 0) {
        return <UserNav />
    }
    return <DefaultNav />
}

export default function Timeline({ socket, heightLimit, instructorArray }) {

    const [year, setYear] = useState(2022);

    let thisYear = new Date();
    thisYear.setFullYear(year, 0, 1, 1);

    console.log(instructorArray);
    console.log(thisYear);

    let weekInformation = { weekNum: 0, weekRangesArray: [], indexMap: {} };

    const initialMonthArray = getMonthArray(thisYear);

    const [year_month_array, setYearMonthArray] = useState(initialMonthArray);

    const monthNameArray = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const monthWeekArray = [
        5, 4, 4, 5, 4, 4, 5, 4, 4, 5
    ];

    const firstWeekArray = getFirstWeek();

    const [monthArray,] = useState(year_month_array);

    const [current_month, setCurrentMonth] = useState(0);

    const [month_weeks, setMonthWeeks] = useState(monthWeekArray[current_month]);

    const [first_week, setFirstWeek] = useState(firstWeekArray[0]);

    const [display, setDisplay] = useState('Month');


    function getMonthArray(year) {

        const monthArray = Array.from(Array(12).keys()).map((item, i) => {
            return ({
                monthIndex: i,
                weeks: getWeeks(year, i, weekInformation),
            });
        });

        return monthArray;
    }

    let totalWeeks = 0;
    for (let i = 0; i < monthArray.length; i++) {
        totalWeeks += monthArray[i].weeks.length;
    }

    function nextMonth() {


        if (current_month === 11) {
            setYear(year + 1);
            thisYear.setFullYear(year, 0, 1);

            thisYear.setMonth(thisYear.getMonth() + 12);

            setYearMonthArray(getMonthArray(thisYear));


            setCurrentMonth(0);
            setMonthWeeks(weekInformation.weekRangesArray[0].times.length);
            setFirstWeek(firstWeekArray[0]);
        } else {
            setCurrentMonth(current_month + 1);
            setMonthWeeks(weekInformation.weekRangesArray[current_month + 1].times.length);
            setFirstWeek(firstWeekArray[current_month + 1]);
        }
    }

    function previousMonth() {

        if (current_month === 0) {
            setYear(year - 1);

            thisYear.setMonth(thisYear.getMonth() - 12);

            setYearMonthArray(getMonthArray(thisYear));

            setCurrentMonth(11);
            setMonthWeeks(weekInformation.weekRangesArray[11].times.length);
            setFirstWeek(firstWeekArray[11]);
        } else {
            setCurrentMonth(current_month - 1);
            setMonthWeeks(weekInformation.weekRangesArray[current_month - 1].times.length);
            setFirstWeek(firstWeekArray[current_month - 1]);
        }
    }

    function getFirstWeek() {
        var firstWeek = [0];

        for (var i = 0; i < 12; i++) {
            var weekNumber = weekInformation.weekRangesArray[i].times.length + firstWeek[i];
            firstWeek.push(weekNumber);
        }
        return firstWeek;
    }

    const createMonth = (item, i) => {
        return (
            <Month key={monthNameArray[item.monthIndex] + " month"} title={monthNameArray[item.monthIndex]}
                position={{ x: 1, y: i === 0 ? i + 3 : getNumberOfWeeks(year_month_array, i) + 3 }} weeks={item.weeks}
                next={nextMonth} previous={previousMonth} currentYear={year} />
        );
    }

    const createWeeks = () => {

        return (
            <NoCollisionLayout socket={socket} heightLimit={heightLimit} newInstructorArray={instructorArray}
                weekInformation={weekInformation} totalWeeks={totalWeeks} firstWeek={first_week}
                currentMonthWeeks={month_weeks} currentMonth={current_month} year={year} />
        )
    }

    const createMonthYear = (item, i) => {
        return <MonthYear key={monthNameArray[item.monthIndex] + " month"} title={monthNameArray[item.monthIndex]}
            position={{ x: 1, y: i === 0 ? i + 3 : getNumberOfWeeks(initialMonthArray, i) + 3 }} weeks={item.weeks} />
    }


    const handleChange = (event) => {
        setDisplay(event.target.value);
    }

    const createDisplayOption = () => {

        return (
            <div>
                <FormControl sx={{ m: 1, minWidth: 80 }}>
                    <InputLabel id="display-select-label">View</InputLabel>
                    <Select
                        labelId="display-select-label"
                        id="display-select"
                        value={display}
                        onChange={handleChange}
                        autoWidth
                        label="Display"
                    >
                        <MenuItem value={"Year"}>Year</MenuItem>
                        <MenuItem value={"Month"}>Month</MenuItem>
                    </Select>
                </FormControl>
            </div>
        )
    }


    console.log(thisYear);

    if (display === "Month") {
        return (
            <React.Fragment>
                <SelectNav userStatus={ReactSession.get("admin")} />
                <div className="grid-container-months">
                    {
                        createDisplayOption()
                    }
                    {
                        createMonth(monthArray[current_month])
                    }
                </div>
                {
                    createWeeks()
                }
            </React.Fragment>
        );
    } else {
        return (
            <React.Fragment>
                <SelectNav userStatus={ReactSession.get("admin")} />
                <div className="grid-container-months">
                    {
                        createDisplayOption()
                    }
                    {
                        monthArray.map((item, i) => {
                            return (
                                createMonthYear(item, i)
                            )
                        })
                    }
                </div>
                <NoCollisionYear socket={socket} heightLimit={heightLimit} newInstructorArray={instructorArray} weekInformation={weekInformation} totalWeeks={totalWeeks} />
            </React.Fragment>
        )
    }

}

function getWeeks(startDate, month, weekInformation) {
    const weeks = [];
    const weekTimes = { month: startDate.getMonth(), times: [] };

    // Retrieve first days of every week in all of the months
    while (startDate.getMonth() === month) {
        // Save the date to an array to position courses in the timeline
        const index = weekInformation.weekNum + weeks.length
        const date = new Date(startDate.getTime());
        weekTimes.times.push({ index: index, date: date });
        weekInformation.indexMap[index] = date;

        // Get the first day of every week
        weeks.push(startDate.getDate());

        // Increment the date by a week
        startDate.setDate(startDate.getDate() + 7);
    }

    weekInformation.weekRangesArray.push(weekTimes);
    weekInformation.weekNum += weeks.length;
    return weeks;
}

function getNumberOfWeeks(weeks, index) {
    let sum = 0;

    for (let i = index - 1; i >= 0; i--) {
        sum += weeks[i].weeks.length;
    }

    return sum;
}