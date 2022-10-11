import React from "react";

export default function Month({ title, socket, position, weeks }) {
    return (
        <React.Fragment>
            <div className="grid-month" style={{ gridArea: position.x + " / " + position.y + " / span 1 / span " + weeks.length }}>
                <h2 className="grid-header">{title}</h2>
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