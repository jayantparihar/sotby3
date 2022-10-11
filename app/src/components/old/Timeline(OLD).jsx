import React from "react";
import Month from './Month';
import Slot from './Slot';
import RowHeader from './RowHeader';
import ElementInput from "./ElemenInput";

export default class Timeline extends React.PureComponent {
    constructor({props, socket}) {
        super(props);
        
        this.socket = socket;
        this.monthArray = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
        ];
        this.rowHeaderArray = [
            "Jackson",
            "Pete",
            "Michelle",
            "Ken",
            "Abigail",
            "Sam",
            "Ross",
        ];

        this.state = {
            monthItems:                     
                this.monthArray.map((item, i) => {
                    return(
                            this.createMonth(item, i)
                        )
                }),

            rowHeaderItems:
                this.rowHeaderArray.map((item, i) => {
                    return (
                        this.createRowHeader(item, i)
                    )
                }),
        };

        /*
        this.monthItems =                         
            this.monthArray.map((item, i) => {
                return(
                        this.createMonth(item, i)
                    )
            });

        this.rowHeaderItems =
            this.rowHeaderArray.map((item, i) => {
                return (
                    this.createRowHeader(item, i)
                )
            });*/
    }

    createRowHeader(item, i) {
        return <RowHeader key={item + "rowHeader" + i} text={item} socket={this.socket} position={{x: i*2+1, y: 1}}/>
    }

    createMonth(item, i) {
        return <Month key={item + " month"} title={item} position={{x: 1, y: i === 0 ? i+3 : (i) * 5 + 3}} />
    }

    addMonth = (text) => {
        console.log(this.state.inputValue);
        let row = this.createRowHeader(text, this.state.rowHeaderItems.length);
        this.state.rowHeaderItems.push(row);
    }

    fillSpaces() {
        let slotArray = [];
        for(let x = 1; x < 50; x++) {
            for(let y = 3; y < 40; y++) {
                slotArray.push(<Slot key={"slot x:" + x + "y:" + y} socket={this.socket} position={{x: x, y: y}} />);
            }
        }
        return slotArray;
    }

    render() {
        return(
            <React.Fragment>
                <div className="grid-container-months">
                    {
                        this.state.monthItems
                    }
                </div>
                <div className="grid-container-layout">
                    {
                        this.fillSpaces()
                    }
                    {
                        this.state.rowHeaderItems
                    }
                </div>
                <ElementInput text={"Add Row: "} callBack={(text) => this.addMonth(text)}/>
                {/*this.inputBox
                <button onClick={this.addMonth}>Add Row</button>*/}
            </React.Fragment>
        );
    }
}