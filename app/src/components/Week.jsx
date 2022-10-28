import React from "react";
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import {useEffect} from 'react';
import { useState } from 'react';

// this code is copy paste from month.jsx. i altered it to be a week view.
export default function Week({ title, socket, position, next, previous, currentYear, current_date }) {
    
    const weekDayNameArray = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday'
    ]

    let d2 = new Date(current_date)
    const weeks = weekDayNameArray.map((element) => {
        let weekDayName = String(element + '  ' + String(d2.getDate()))
        d2.setDate(d2.getDate() + 1)
        return  weekDayName
    })
    
    return (
        <React.Fragment>
            <div className="grid-month" style={{ gridArea: position.x +" / " + position.y  + " / span 1 / span " + weeks.length }}>
                <Stack direction="row" spacing={1}>
                    <IconButton aria-label="back" onClick={previous}>
                        <ArrowBackIosIcon />
                    </IconButton>
                    <h2 className="grid-header">{title}</h2>
                    <IconButton aria-label="next" onClick={next}>
                        <ArrowForwardIosIcon />
                    </IconButton>
                    <h2 className="grid-header">{currentYear}</h2>
                </Stack>
            </div>
            {
                weeks.map((item, i) => {
                    return <div key={title + item} className="grid-day" style={{ gridArea: (position.x + 1) + " / " + (position.y + i) + " / span 1 / span 1" }}>
                        {item}
                        
                    </div>
                })
            }
        </React.Fragment>
    );
}
