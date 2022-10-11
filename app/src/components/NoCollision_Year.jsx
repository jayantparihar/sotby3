import React from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import _ from "lodash";
import TimelineGrid from "./TimelineGrid";
import { Link } from 'react-router-dom';
import { ReactSession } from 'react-client-session';
const ReactGridLayout = WidthProvider(RGL);


export default class LocalStorageLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    rowHeight: 100,
    margin: [2, 2],
    allowOverlap: true,
    preventCollision: false,
    resizeHandles: ['e'],
    compactType: null,
    autoSize: true
  };

  constructor({ props, socket, heightLimit, newInstructorArray, weekInformation, totalWeeks }) {
    super(props);

    this.state = {
      // Loop through the instructor array to get all the courses associated with them
      items: newInstructorArray.reduce(function (acc, element, index) {
        if ((element.timeblocks.length === 0 && element.vacations.length === 0) || weekInformation.length === 0) {
          return acc;
        }

        // Create a course element for every timeblock and concatenate them into one array
        let arr = acc.concat(
          element.timeblocks.map((info) => {
            const start = findWeekIndex(weekInformation, info.start);
            const end = findWeekIndex(weekInformation, info.end) + 1;
            return (
              {
                text: info.name,
                caId: info.caId,
                userId: info.userId,
                courseNum: info.courseNum,
                data: {
                  i: info.caId,
                  x: start,
                  y: index * 2,
                  w: end - start,
                  h: 1,
                }
              }
            )
          })
        );

        return arr.concat(
          element.vacations.map((info) => {
            const start = findWeekIndex(weekInformation, info.vacationStart);
            const end = findWeekIndex(weekInformation, info.vacationEnd) + 1;
            return (
              {
                text: info.userId + "'s Vacation",
                uid: info.userId,
                vid: info.vacationId,
                data: {
                  i: info.userId + info.vacationId,
                  x: start,
                  y: (index * 2) + 1,
                  w: end - start,
                  h: 1,
                }
              }
            )
          })
        );
      }, []),
      heightLimit: heightLimit.get,
      weekInformation: weekInformation,
      instructorArray: newInstructorArray
    };
    this.socket = socket;
    this.heightLimit = heightLimit;
    this.totalWeeks = totalWeeks;

    this.socket.on("itemChanged", (item) => {
      console.log("Item Received: " + JSON.stringify(item));

      this.replaceItem(item);
    });

    this.socket.on("courseAdded", (item) => {
      console.log("Item Received: " + JSON.stringify(item));

      this.onAddCourse(item, parseInt(item.x), parseInt(item.y), false);
    });

    this.socket.on("courseDeleted", (i) => {
      console.log("Item Received: " + JSON.stringify(i));

      this.onRemoveItem(i, false);
    });

    this.socket.on("vacationApproved", (vacation) => {
      console.log("Item Received: " + JSON.stringify(vacation));

      this.onAddVacation(vacation);
    });

    this.socket.on("vacationDeleted", (vacation) => {
      console.log("Item Received: " + JSON.stringify(vacation));

      this.onRemoveVacation(vacation.vacation_id, false);
    })
  }

  replaceItem = (item) => {
    for (let i = 0; i < this.state.layout.length; i++) {
      if (this.state.layout[i].i === item.i) {
        const newLayout = this.state.layout.slice();
        newLayout[i] = item;

        this.setState({
          layout: newLayout
        });

        break;
      }
    }
  }

  onLayoutChange = (layout, layouts) => {
    this.setState({
      layout: layout
    });
  }

  onItemChange = (layout, oldItem, newItem) => {
    // Update the dates on the postgresql database
    const startDate = findWeekDate(this.state.weekInformation, newItem.x);
    const endDate = findWeekDate(this.state.weekInformation, newItem.w + newItem.x - 1);

    // HTTP request instead of sockets

    const index = _.findIndex(this.state.items, (element) => { return element.data.i.toString() === newItem.i });
    const foundItem = this.state.items[index];

    // Restrict movement of the course to one row only
    const yAxisLockedItem = newItem;
    yAxisLockedItem.y = oldItem.y;
    this.replaceItem(yAxisLockedItem);

    const instructor = this.state.instructorArray[Math.floor(newItem.y / 2)];
    this.socket.emit('itemChanged', yAxisLockedItem, { username: instructor.key, courseNum: foundItem.courseNum, caId: foundItem.caId, start: startDate.getTime(), end: endDate.getTime() });
  }

  onAddVacation = (info) => {
    const start = findWeekIndex(this.state.weekInformation, new Date(info.start_date));
    const end = findWeekIndex(this.state.weekInformation, new Date(info.end_date)) + 1;
    const index = _.findIndex(this.state.instructorArray, (element) => { return element.key === info.username });

    const newVacation = {
      text: info.username + "'s Vacation",
      uid: info.username,
      vid: info.vacation_id,
      data: {
        i: info.username + info.vacation_id,
        x: start,
        y: (index * 2) + 1,
        w: end - start,
        h: 1,
      }
    }

    this.setState({
      items: this.state.items.concat(
        newVacation
      )
    });
  }

  onAddCourse = (course, x = 0, y = 0, emit = true) => {
    const w = parseInt(course.weeklength);

    const startDate = findWeekDate(this.state.weekInformation, x);
    const endDate = findWeekDate(this.state.weekInformation, w + x - 1);
    const instructor = this.state.instructorArray[Math.floor(y / 2)];

    // User/ instructor was deleted, can't create a course
    if (instructor === undefined) {
      return;
    }

    if (emit) {
      this.socket.emit('courseAdded', { ...course, x: x, y: y, instructorKey: instructor.key, courseNum: course.number, start: startDate.getTime(), end: endDate.getTime() });
    } else {
      this.setState({
        // Add a new item
        items: this.state.items.concat({
          text: course.title,
          userId: instructor.key,
          courseNum: course.number,
          caId: course.caId,
          data: {
            i: course.caId,
            x: x,
            y: y,
            w: w,
            h: 1,
          }
        }),
      });
    }
  }

  onRemoveItem(i, emit = true) {
    // Find the index of the course element in the state
    const index = _.findIndex(this.state.items, (element) => { return element.data.i === i });
    const foundItem = this.state.items[index];

    // Emit a message to all other applications that a course has been edeleted
    if (emit) {
      this.socket.emit("courseDeleted", foundItem, i);
    }

    // Remove the element from the state
    this.setState({ items: _.reject(this.state.items, (element) => { return element.data.i === i }) });
  }

  onRemoveVacation(vid, emit = true) {
    if (emit) {
      this.socket.emit("vacationDeleted", { vacation_id: vid });
    }

    // Remove the element from the state
    this.setState({ items: _.reject(this.state.items, (element) => { return element.vid === vid }) });
  }

  onRemoveUser = (key, y) => {
    const initialLength = this.state.instructorArray.length;
    this.setState({ instructorArray: _.reject(this.state.instructorArray, (element) => { return element.key === key }) },
      () => {
        // No user/ instructor found to delete
        if (this.state.instructorArray.length !== initialLength) {
          // Remove elements on the same row
          console.log("Removed items at: " + y);
          this.setState({ items: _.reject(this.state.items, (element) => { return element.data.y === y || element.data.y === y + 1 }) }
            , () => {
              console.log(this.state.items);
              // Move course elements up if they are below the user that was deleted
              this.setState({
                items: _.reduce(this.state.items, (acc, element) => {
                  if (element.data.y > y) {
                    const newElement = element;
                    newElement.data.y -= 2;
                    return [...acc, newElement];
                  } else {
                    return [...acc, element];
                  }
                }, [])
              },
                () => {
                  this.setState({
                    layout: _.reduce(this.state.items, (acc, element) => {
                      if (element.vid !== undefined) {
                        const itemData = { ...element.data, isDraggable: false, isResizable: false };
                        return [...acc, itemData];
                      } else {
                        const itemData = element.data;
                        return [...acc, itemData];
                      }
                    }, [])
                  });
                  console.log(this.state.layout);
                });
            });
          // Reset layout so that the items are shifted up visually
        }
      });
  }

  onAddUser = (user) => {
    this.setState({ instructorArray: [...this.state.instructorArray, { key: user.username, name: user.firstname + " " + user.lastname, timeblocks: [], vacations: [] }] });
  }

  createElement(el, isVacation = false) {
    const removeStyle = {
      position: "absolute",
      right: "2px",
      top: 0,
      cursor: "pointer",
      padding: "5px",
      color: "black"
    };
    const dsStyle = {
      position: "absolute",
      left: "2px",
      bottom: 0,
      cursor: "pointer",
      padding: "5px",
      color: "black"
    };

    return (
      <div key={el.data.i} data-grid={isVacation ? { ...el.data, isDraggable: false, isResizable: false } : el.data} name={el.text + " el"} >
        <span className="text">{el.text}</span>
        {
          ReactSession.get("admin") !== undefined ?
            <span
              className="remove"
              style={removeStyle}
              onClick={isVacation ? this.onRemoveVacation.bind(this, el.vid) : this.onRemoveItem.bind(this, el.data.i)}
            >
              x
            </span>
            :
            undefined
        }
        {!isVacation && ReactSession.get("admin") !== undefined ?
          <Link
            to={{
              pathname: "/detailed-schedule",
              search: "?courseNum=" + el.courseNum,
            }}
          >
            <span
              className="remove"
              style={dsStyle}
            >
              Detailed
            </span>
          </Link>
          :
          undefined
        }
      </div>
    );
  }

  render() {
    console.log(this.props.weekInformation);
    console.log(this.state.items);
    console.log(this.totalWeeks);
    return (
      <React.Fragment>
        <TimelineGrid
          socket={this.socket}
          heightLimit={this.heightLimit}
          instructorArray={this.state.instructorArray}
          createCourse={this.onAddCourse}
          totalWeeks={this.totalWeeks}
          onRemoveUser={this.onRemoveUser}
          onAddUser={this.onAddUser} />
        <div className="grid-item-container" style={{ width: this.totalWeeks * 102, position: "absolute" }}>
          <ReactGridLayout
            {...this.props}
            cols={this.totalWeeks}
            maxRows={this.state.heightLimit()}
            layout={this.state.layout}
            onLayoutChange={this.onLayoutChange}
            onResizeStop={this.onItemChange}
            onDragStop={this.onItemChange}
            isDraggable={ReactSession.get("admin") !== undefined ? true : false}
            isResizable={ReactSession.get("admin") !== undefined ? true : false}
          >
            {this.state.items.map(el => this.createElement(el, el.vid !== undefined ? true : false))}
            {/* {this.state.vacations.map(el => this.createElement(el, true))} */}
          </ReactGridLayout>
        </div>
      </React.Fragment>
    );
  }
}

function findWeekIndex(weekInformation, date) {
  // Search for a week in a particular month
  const monthIndex = date.getMonth();

  // Get the first day of every week in that month
  const weekRanges = weekInformation.weekRangesArray[monthIndex].times;

  for (let i = 0; i < weekRanges.length; i++) {
    if (date <= weekRanges[i].date) {
      return weekRanges[i].index;
    }

  }

  // Return the index of the last week of the month
  return weekRanges[weekRanges.length - 1].index;
}

function findWeekDate(weekInformation, index) {
  return weekInformation.indexMap[index];
}
