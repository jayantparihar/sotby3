import React from "react";
import Form from "./Form";
import Popup from "reactjs-popup";

export default function Slot({ name, position, createCourse }) {

  return (
    <div className="grid-slot" style={{ position: "relative", gridArea: position.x + " / " + position.y + " / span 1 / span 1" }}>
      {createCourse &&
        <Popup trigger={
          <button
            name={`${name} slot ${position.y}`}
            style={{ opacity: 0, height: '100%', width: '100%', position: "absolute", zIndex: 99 }}
            onClick={() => { console.log("CLICKCLACK") }}>

          </button>
        } modal>
          <div className="add-row-modal-bg">
            <Form text={"Add Row: "}
              title={"course"}
              textObject={["Week Length", "Color"]}
              isCourse={true}
              callBack={(course) => createCourse(course, position.y - 3, position.x - 1)} /> {/*Coordinates are based on CSS grid, needs to be offset*/}
          </div>
        </Popup>
      }
    </div>
  );
}