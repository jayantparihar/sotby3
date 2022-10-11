import Vacation from "./Vacation"

const VacationList = ({ vacations, onDelete }) => {
	return (
		<div>
			{vacations.map((vacation) => (
				<div key={vacation.id} className="vacation-column vacation-inputs">
					<Vacation vacation={vacation} onDelete={onDelete}
					/>
				</div>
			))}
		</div>
	);
};

export default VacationList;
