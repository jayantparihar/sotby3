import React from "react";
import _ from "lodash";
import TimelineGrid from "./TimelineGrid";
import { Link } from 'react-router-dom';
import { ReactSession } from 'react-client-session';
import RGL, { WidthProvider } from "react-grid-layout";

export default class LocalStorageLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    rowHeight: 100,
    margin: [2, 2],
    allowOverlap: true,
    preventCollision: false,
    resizeHandles: ['e'],
    compactType: null,
    autoSize: true,
  };

  constructor({ props, socket, heightLimit, newInstructorArray, weekInformation,
    totalWeeks, firstWeek, currentMonthWeeks, currentMonth, year }) {
    super(props);

    let timeLineInformation = weekInformation.weekRangesArray[currentMonth];

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
            const end = findWeekIndex(weekInformation, info.end);

            const width = getCourseWidth(start, end, weekInformation, timeLineInformation);

            return (
              {
                start: start,
                end: end,
                text: info.name,
                caId: info.caId,
                userId: info.userId,
                courseNum: info.courseNum,
                data: {
                  i: info.caId,
                  x: start,
                  y: index * 2,
                  w: width,
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

            const width = getCourseWidth(start, end, weekInformation, timeLineInformation);
            return (
              {
                start: start,
                end: end,
                text: info.userId + "'s Vacation",
                uid: info.userId,
                vid: info.vacationId,
                data: {
                  i: info.userId + info.vacationId,
                  x: start,
                  y: (index * 2) + 1,
                  w: width,
                  h: 1,
                }
              }
            )
          })
        );
      }, []),
      heightLimit: heightLimit.get,
      weekInformation: weekInformation,
      instructorArray: newInstructorArray,
      monthWeeks: currentMonthWeeks,
    };

    this.socket = socket;
    this.heightLimit = heightLimit;
    this.totalWeeks = totalWeeks;
    this.mWeeks = currentMonthWeeks;
    this.monthItems = this.state.items.filter((info) => {
      const start = info.start;
      const end = info.end;
      const width = getCourseWidth(start, end, weekInformation, timeLineInformation);

      if (width === 0) {
        return false;
      }

      return true;
    });
    this.itemLayout = [];

    this.socket.on("itemChanged", (item) => {
      console.log("Item Received: " + JSON.stringify(item));

      this.replaceItem(item);
    });

    this.socket.on("courseAdded", (item) => {
      console.log("Item Received: " + JSON.stringify(item));

      var date = new Date(item.start);

      var courseYear = date.getFullYear();

      var adjustment = (courseYear - this.props.year) * 12;

      date.setMonth(date.getMonth() - adjustment);

      item.start = date.getTime();

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
    });
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

  onLayoutChange = (layout) => {
    this.setState({
      layout: layout
    });
  }

  onItemChange = (layout, oldItem, newItem) => {
    // Update the dates on the postgresql database
    const startDate = findWeekDate(this.state.weekInformation, newItem.x);
    const endDate = findWeekDate(this.state.weekInformation, newItem.w + newItem.x - 1);

    // HTTP request instead of sockets
    const index = _.findIndex(this.monthItems, (element) => { return element.data.i.toString() === newItem.i });
    const foundItem = this.monthItems[index];

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

    console.log(x);

    const startDate = findWeekDate(this.state.weekInformation, x + this.props.firstWeek);
    const endDate = findWeekDate(this.state.weekInformation, w + x + this.props.firstWeek);
    const instructor = this.state.instructorArray[Math.floor(y / 2)];

    const start = findWeekIndex(this.state.weekInformation, startDate);
    const end = findWeekIndex(this.state.weekInformation, endDate);

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
          start: start,
          end: end,
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
    console.log(this.state.items);
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

  createElement(el, isVacation = false, layout) {
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
      <div key={el.data.i} data-grid={isVacation ? { ...el.data, isDraggable: false, isResizable: false } : el.data}
        name={el.text + " el"}>
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

  createItemGrid(props) {

    const ReactGridLayout = WidthProvider(RGL);

    this.updateItems();
    return (
      <ReactGridLayout
        {...props}
        cols={this.props.currentMonthWeeks}
        maxRows={this.state.heightLimit()}
        layout={this.state.layout}
        isDraggable={ReactSession.get("admin") !== undefined ? true : false}
        isResizable={ReactSession.get("admin") !== undefined ? true : false}
        autoSize={true}
      >
        {this.monthItems.map(el => this.createElement(el, el.vid !== undefined ? true : false, this.props.currentMonthWeeks))}
      </ReactGridLayout>
    )
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.weekInformation.weekRangesArray[this.props.currentMonth].month !== prevProps.weekInformation.weekRangesArray[this.props.currentMonth].month) {
      this.onLayoutChange(this.itemLayout);
    }
  }


  resize = () => this.forceUpdate();

  componentDidMount() {
    window.addEventListener('resize', this.resize);
  }

  updateItems() {

    var items = [];

    var random = this.state.items.filter((item) => {
      const start = item.start;
      const end = item.end;

      const width = getCourseWidth(start, end, this.props.weekInformation, this.props.weekInformation.weekRangesArray[this.props.currentMonth]);
      if (width === 0) {
        return false;
      }

      return true;
    })

    random.forEach(element => {
      const width = getCourseWidth(element.start, element.end, this.props.weekInformation, this.props.weekInformation.weekRangesArray[this.props.currentMonth]);
      element.data.w = width;
      element.data.i = element.data.i.toString();
      element.data.maxW = this.props.currentMonthWeeks;
      items.push(element.data);
    });
    this.monthItems = random;
    this.itemLayout = items;

    return items;
  }

  render() {
    return (
      <React.Fragment>
        <TimelineGrid
          socket={this.socket}
          heightLimit={this.heightLimit}
          instructorArray={this.state.instructorArray}
          createCourse={this.onAddCourse}
          totalWeeks={this.props.currentMonthWeeks}
          onRemoveUser={this.onRemoveUser}
          onAddUser={this.onAddUser} />
        <div className="grid-item-container" style={{ width: this.props.currentMonthWeeks * 102, position: "absolute" }}>
          {this.createItemGrid(this.props)}
        </div>
      </React.Fragment>
    );
  }
}

function getCourseWidth(start, end, weekInformation, timeLineInformation) {
  const monthStart = findWeekIndex(weekInformation, timeLineInformation.times[0].date);
  const monthEnd = findWeekIndex(weekInformation, timeLineInformation.times[timeLineInformation.times.length - 1].date);

  const course = _.range(start, end);
  const month = _.range(monthStart, monthEnd + 1);

  const intersection = course.filter(value => month.includes(value));

  return intersection.length;

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
