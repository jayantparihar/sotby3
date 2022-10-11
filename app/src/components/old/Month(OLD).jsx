import React from "react";

export default class Month extends React.PureComponent {
    constructor({props, title, socket, position}) {
        super(props);

        this.socket = socket;
        this.title = title;
        this.position = position;
        this.weeks = [
            0,
            7,
            14,
            21,
            28
        ];
    }

    render() {
        return(
            <React.Fragment>
                <div className="grid-month" style={{gridArea: this.position.x + " / " + this.position.y + " / span 1 / span " + this.weeks.length}}>
                    <h2 className="grid-header">{this.title}</h2>
                </div>
                {
                    this.weeks.map((item, i) => {
                        return <div key={this.title + item} className="grid-day" style={{gridArea: (this.position.x + 1) + " / " + (this.position.y + i) + " / span 1 / span 1"}}>
                            {item}
                        </div>
                    })
                }
            </React.Fragment>
        );
    }
}