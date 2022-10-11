import React from "react";
import Slot from "./Slot";
import { ReactSession } from 'react-client-session';

export default function RowHeader({position, text, width, height, removeFunction, createCourse}) {
    const createRowSlots = () => {
        let slots = [];
        for(let y = 0; y < width; y++) {
            for(let x = 0; x < height; x++) {
                slots.push({
                    key: text + "x:" + (position.x + x) + "y:" + (position.y + y),
                    pos: {x: position.x + x, y: position.y + y + 2},
                });
            }
        }
        return slots;
    }

    const createSlot= (item, i) => {
        return(
            <Slot key={item.key} position={{x: item.pos.x, y: item.pos.y}} 
            // Rowheader has 2 rows associated with it, one that can create courses, one that can't (vacation row)
            createCourse={item.pos.x % 2 === 1 ? createCourse : null} 
            name={text}/>
        );
    }

    // const [slotArray, ] = useState(createRowSlots());

    let slotArray = createRowSlots();

    return(
        <React.Fragment>
            <div className="grid-row-header" style={{gridArea: position.x + " / " + position.y + " / span 2 / span 2"}}>
                {
                    ReactSession.get("admin") === 1 ? 
                    <button name={text + " remove"} className="grid-row-header-close" onClick={removeFunction}>
                        <p>Remove</p>
                    </button>
                    :
                    undefined
                }
                <p>{text}</p>
            </div>
            {slotArray.map((item, i) => {
                return (
                    createSlot(item, i)
                )
            })}
        </React.Fragment>
    );
}