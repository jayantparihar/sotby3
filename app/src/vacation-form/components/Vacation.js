import { makeStyles } from '@material-ui/core/styles';
import { styled } from '@mui/system';
import ClearIcon from '@mui/icons-material/Clear';
import Button from "@material-ui/core/Button";
import React, { Component }  from 'react';
const VacationLayout = styled('div')({
	display: "flex",
	flexDirection: "row",
	alignItems: "left",
	border: "1px solid steelblue",
	width: "fit-content",
	height: "fit-content",
})

const VacationDetailSeparator = styled('div')({
	display: "flex",
	flexDirection: "row",
})

const VacationDetailWrapper = styled('div')({

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
	},
	clearButton: {
		border: 0,
		borderRadius: 28,
		background: "white",
		color: "red",
		"&:hover": {
			background: "red",
			color: "white",
		}
	},
});

const Vacation = ({ vacation, onDelete }) => {
	return (
		<VacationLayout>
			<VacationDetailWrapper>
				<VacationDetailSeparator>
					<div className="vacation-grid-box padding-top">{vacation.NC}</div>
				</VacationDetailSeparator>
				<VacationDetailSeparator>
					<div className="vacation-grid-box padding-top">Date:{vacation.startingMonth}</div>
					<text>/</text>
					<div className="vacation-grid-box padding-top">{vacation.startingDay}</div>
					<text> ~ </text>
					<div className="vacation-grid-box padding-top">{vacation.endingMonth}</div>
					<text>/</text>
					<div className="vacation-grid-box padding-top">{vacation.endingDay}</div>
				</VacationDetailSeparator>
				<div className="vacation-grid-box padding-top">Days: {vacation.day}</div>
				<div className="vacation-grid-box padding-top">Type: {vacation.VABT}</div>
				<div className="vacation-grid-box vacation-label-notes padding">
					{vacation.notes}
				</div>
			</VacationDetailWrapper>
			<Button onClick={() => onDelete(vacation.id)} className={buttonStyles().clearButton}>
				<ClearIcon />
			</Button>
		</VacationLayout>
	);
};

export default Vacation;
