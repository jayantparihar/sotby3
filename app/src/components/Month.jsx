import React from "react";
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

export default function Month({ title, socket, position, weeks, next, previous, currentYear }) {

    return (
        <React.Fragment>
            <div className="grid-month" style={{ gridArea: position.x + " / " + position.y + " / span 1 / span " + weeks.length }}>
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
