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
// week import
import NoCollisionWeek from './NoCollision_Week';
import MonthYear from './Month_Year';
import Week from './Week';


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
    thisYear.setFullYear(year, 0, 1);

    // this is a base for when the app starts
    let startYear =  new Date("Jan 01, 2022 00:00:00");


    // console.log('instructorArray',instructorArray);
    // console.log('thisYear',thisYear);

    let weekInformation = { weekNum: 0, weekRangesArray: [], indexMap: {} };


    const initialMonthArray = getMonthArray(thisYear);

    // const initialDayArray = getWeekDayArray(thisYear);

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
    // week view
    const weekDayNameArray = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday'
    ]

    const firstWeekDayNameArray = [
        'Monday 3',
        'Tuesday 4',
        'Wednesday 5',
        'Thursday 6',
        'Friday 7'
    ]


    const monthWeekArray = [
        5, 4, 4, 5, 4, 4, 5, 4, 4, 5
    ];


    

    const firstWeekArray = getFirstWeek();

    const [monthArray,] = useState(year_month_array);

    const [current_month, setCurrentMonth] = useState(0);

    const [current_month_name, setCurrentMonthName] = useState(monthNameArray[current_month])
    // week view
    const [current_week, setCurrentWeek] = useState(0);

    const [month_weeks, setMonthWeeks] = useState(monthWeekArray[current_month]);

    const [first_week, setFirstWeek] = useState(firstWeekArray[0]);
    // week view
    const [first_day, setFirstDay] = useState(1);

    const [display, setDisplay] = useState('Week');
    //week view
    const [current_date, setCurrentDate] = useState(new Date("Jan 03, 2022 00:00:00"))
    //week view
    const [current_day_name_array, setDayNameArray] = useState(firstWeekDayNameArray)
    
    console.log('current_date', current_date)

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
    // see the 'previousWeek' function. its the same thing as this but mirrored.
    // console.log(new Date(2022, 01, 32))
    const nextWeek = async () => {
        let d2 = new Date(current_date)

        setDayNameArray(weekDayNameArray.map((element) => {
            let weekDayName = String(element + '  ' + String(d2.getDate()))
            d2.setDate(d2.getDate() + 1)
            return  weekDayName
        }))



        let new_date = new Date(current_date)
        const d = new Date(new_date.setDate(current_date.getDate() + 7))

        let next_week_friday = new Date(new_date)
        next_week_friday.setDate(current_date.getDate() + 4)
        const friday_month = next_week_friday.getMonth();

        if (current_month_name.includes('-')) {
            setCurrentMonthName(monthNameArray[current_month])
        }

        if ( friday_month!=current_date.getMonth() ){
            if (current_month == 11){
                setCurrentMonthName(monthNameArray[current_month] + ' - ' + monthNameArray[0] );
                setCurrentMonth(0);
                setYear(year + 1);
            } else {
                setCurrentMonthName(monthNameArray[current_month] + ' - ' + monthNameArray[current_month + 1] )
                setCurrentMonth(current_month + 1);
            }
        } else {
            if (current_date.getMonth() != d.getMonth()) {
                if (current_month == 11) {
                    setCurrentMonthName(monthNameArray[0])
                    setCurrentMonth(0);
                    setYear(year + 1);
                } else {
                    setCurrentMonthName(monthNameArray[current_month + 1])
                    setCurrentMonth(current_month + 1);
                }
            }
        }
        
        setCurrentDate(d)
        // setDayNameArray(changeDayNameArray())

    }

    // this function determines the week header for the previous week
    function previousWeek() {
        let d2 = new Date(current_date)

        setDayNameArray(weekDayNameArray.map((element) => {
            let weekDayName = String(element + '  ' + String(d2.getDate()))
            d2.setDate(d2.getDate() + 1)
            return  weekDayName
        }))


        // Step 1: find the date of last week monday
        let d = new Date(current_date)
        //last week monday
        d.setDate(d.getDate() - 7)


        // step 2: find the date of last friday (monday + 4 days)
        let next_date = new Date(d)
        next_date.setDate(next_date.getDate() + 4)
        const friday_month = next_date.getMonth()

        // This checks if the last month title was like jan-feb.
        // if so change it to a regular month
        if (current_month_name.includes('-')) {
            setCurrentMonthName(monthNameArray[current_month])
        }

        console.log(current_month)
        // tip: these nested if statements should be nested the other way round. lots of redundency here.
        // if friday and monday of last week is not the same.
        // then make title like jan-feb
        if ( friday_month!=current_date.getMonth() ){
            
            // before setting the title determine if the next month of the previous year (going from jan to dec)
            if (current_date.getMonth() == 0){
                setCurrentMonthName(monthNameArray[current_date.getMonth()] + ' - ' + monthNameArray[11] )
                setCurrentMonth(11);
                setYear(year - 1);
            // if not then do this.
            } else {
                setCurrentMonthName(monthNameArray[current_date.getMonth()] + ' - ' + monthNameArray[current_month - 1] )
                setCurrentMonth(current_month - 1);
            }
        } else {
            // if previous week is in a different month entirely. then set month title to ie jan
            if (current_date.getMonth() != d.getMonth()) {
                // before setting the title determine if the next month of the previous year (going from jan to dec)
                if (current_date.getMonth() == 0){
                    setCurrentMonthName(monthNameArray[11])
                    setCurrentMonth(11);
                    setYear(year - 1);
                // if not then do this.
                } else {
                    setCurrentMonthName(monthNameArray[current_date.getMonth() - 1])
                    setCurrentMonth(current_date.getMonth() - 1);
                }
            }
        }
        // change the current_date (this variable is important for displaying the course_assingments)
        setCurrentDate(d)
        // change the (monday 1, tuesday 2.. etc)
  
        // setDayNameArray(changeDayNameArray())

    }

    // creates a new label for each weekday header (from monday 3, tuesday 4.... to monday 10, tuesday 11...)
    function changeDayNameArray() {
        const d = new Date(current_date)
        const newNameArray = weekDayNameArray.map((element) => {
            let weekDayName = String(element + '  ' + String(d.getDate()))
            d.setDate(d.getDate() + 1)
            return  weekDayName
        })
        return newNameArray
    }

    function getFirstWeek() {
        var firstWeek = [0];

        for (var i = 0; i < 12; i++) {
            var weekNumber = weekInformation.weekRangesArray[i].times.length + firstWeek[i];
            firstWeek.push(weekNumber);
        }
        return firstWeek;
    }

    
    const createWeekColumns = () => {
        
        return (
            <NoCollisionLayout socket={socket} heightLimit={heightLimit} newInstructorArray={instructorArray}
            weekInformation={weekInformation} totalWeeks={totalWeeks} firstDate={new Date("Jan 03, 2022 00:00:00")}
            currentMonthWeeks={month_weeks} currentMonth={current_month} year={year} />
            )
        }
    // this is just for the week view rows and instructor header. it imports 'noCollision_week.jsx'.
    // keep in mind some of these values are useless as it was originally copied from the month_view one above ^
    const createDayColumns = () => {
        const current_week_date = ''
        return (
            <NoCollisionWeek socket={socket} heightLimit={heightLimit} newInstructorArray={instructorArray}
            weekInformation={weekInformation} totalWeeks={7} currentDate={current_date} firstWeek={first_week} firstDay={first_day}
            currentWeekDays={5} currentMonth={current_month} currentWeek={current_week} year={year} />
            )
        }
    const createMonth = (item, i) => {
        return (
            <Month key={monthNameArray[item.monthIndex] + " month"} title={monthNameArray[item.monthIndex]}
                position={{ x: 1, y: i === 0 ? i + 3 : getNumberOfWeeks(year_month_array, i) + 3 }} weeks={item.weeks}
                next={nextMonth} previous={previousMonth} currentYear={year} />
        );
    }
            
    const createMonthYear = (item, i) => {
        return <MonthYear key={monthNameArray[item.monthIndex] + " month"} title={monthNameArray[item.monthIndex]}
            position={{ x: 1, y: i === 0 ? i + 3 : getNumberOfWeeks(initialMonthArray, i) + 3 }} weeks={item.weeks} />
    }
    // this is just for the week view header. it imports 'Week.jsx'
    // keep in mind some of these values are useless as it was originally copied from the month_view one above ^ 'createMonth()'
    const createWeek = (week_day_names, item, i) => {
        console.log('createWeek says hi')
        return (
            <Week key={monthNameArray[current_month] + " month"} title={current_month_name}
                position={{ x: 1, y: i === 0 ? i + 3 : 3}} 
                next={nextWeek} previous={previousWeek} currentYear={year} current_date={current_date} />
        );
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
                        <MenuItem value={"Week"}>Week</MenuItem>
                        <MenuItem value={"Year"}>Year</MenuItem>
                        <MenuItem value={"Month"}>Month</MenuItem>
                    </Select>
                </FormControl>
            </div>
        )
    }


    

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
                    createWeekColumns()
                }
            </React.Fragment>
        );
    } else if (display === "Week") {
        return (
            <React.Fragment>
                <SelectNav userStatus={ReactSession.get("admin")} />
                <div className="grid-container-weeks">
                    {
                        createDisplayOption()
                    }
                    {
                        createWeek(current_day_name_array,monthArray[current_month]    )
                    }
                </div>
                {
                    createDayColumns()
                }
            </React.Fragment>
        )
    }
    if (display === "Year") {
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