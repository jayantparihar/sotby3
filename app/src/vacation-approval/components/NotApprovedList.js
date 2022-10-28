import VacationEntry from "./VacationEntry"
import React, { Component }  from 'react';

const NotApprovedList = ({ vacations, onApprove, onReject }) => {

    const capitalizeString = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

    const usernameToName = (vacation) => {
        let first = vacation.username.split("_")[0]
        let last = vacation.username.split("_")[1]
        first = capitalizeString(first)
        last = capitalizeString(last)
        return [first, last]
    }

    return (
        <div className="approval-list">
            {vacations.map((vacation) => (
                <div key={vacation.vacation_id}>
                    <VacationEntry
                        vacation={vacation}
                        name={usernameToName(vacation)}
                        onApprove={onApprove}
                        onReject={onReject} />
                </div>
            ))}
        </div>
    )
}

export default NotApprovedList
