import React from "react";

export default class Slot extends React.PureComponent {
    constructor({props, socket, position, text}) {
        super(props);

        this.socket = socket;
        this.item = null;
        this.position = position;
        this.text = text;
    }

    render() {
        return(
            <React.Fragment>
                <div className="grid-row-header" style={{gridArea: this.position.x + " / " + this.position.y + " / span 2 / span 2"}}>
                    <p>{this.text}</p>
                </div>
            </React.Fragment>
        );
    }
}