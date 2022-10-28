import React from "react";
import _ from "lodash";
import TimelineGridWeek from "./TimelineGrid_Week";
import { Link } from 'react-router-dom';
import { ReactSession } from 'react-client-session';
import RGL, { WidthProvider } from "react-grid-layout";

export default class LocalStorageLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    rowHeight: 80,
    margin: [2, 2],
    allowOverlap: true,
    preventCollision: false,
    resizeHandles: ['e'],
    compactType: null,
    autoSize: true,
  };
  //###############################################################################
  // ---------DISCLAMER: THIS WILL BE PAINFUL TO LOOK AT. IM SORRY :(.  -love matt
  //############################################################################### 
  
  constructor({ props, socket, heightLimit, newInstructorArray, weekInformation,  
    totalWeeks, firstWeek, firstDay, currentWeekDays, currentMonth, currentWeek, currentDate, year }) {
    super(props);

    let timeLineInformation = weekInformation.weekRangesArray[currentMonth];

    this.state = {
      // Loops through the instructor array to get all the courses associated with them
      items: newInstructorArray.reduce(function (acc, element, index) {

        if ((element.timeblocks.length === 0 && element.vacations.length === 0) || weekInformation.length === 0) {
          
          return acc;
        }

        // Create a course element for every timeblock and concatenate them into one array
        // KEEP IN MIND. it concatenates through every course_assingment in the database. ikr?!?!?!? i didnt do this i swear
        // btw most of this file is copy pasted code. 
        let arr = acc.concat(
          element.timeblocks.map((info) => {

            // this stuff determines the amount of days the course_assignments are from the firstDate -> jan 3, 2022
            const start = getDayRange(currentDate, info.start)
            const end = getDayRange(currentDate, info.end) + 1
            // console.log('timeblock start, end', start, end)
            // console.log('current Date', currentDate)
            // console.log('info.start', info.start.getDate()) 
            // console.log('info.end', info.end.getDate())
            // console.log('start', start)
            // console.log('end', end)
            // console.log('currentDate', currentDate)

            // determines how many days this event will stretch on the week view.
            // it will give any course_assignment that isnt shown in the first week a width of 0. (makes it invisible :0)
            const width = getCourseWidth(start, end, currentDate);
            // console.log('width', width)
            // the data values are basically coordinates and dimensions for a 'react-grid-layout' or RGL.
            // i recommend looking the documentation to know what this is doing (lookup: RGL and react-grid-layout).
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
        // this isnt not relevant to the week view but i havent touched it so idk if removing it will break the app.(it prob will)
        return arr.concat(
          element.vacations.map((info) => {
            const start = getDayRange(currentDate, info.vacationStart);
            const end = getDayRange(currentDate, info.vacationEnd) + 1;

            const width = getCourseWidth(start, end, weekInformation, timeLineInformation, currentDate);
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
      currentWeekDays: currentWeekDays,
      // i added these. again sorry. i made the same value twice and didnt realize it.
      //makes a static value that can be read all over this file.
      firstWeek: currentWeek,
      currentWeek: currentWeek

    };
    //makes a static value that can be read all over this file. see next change at line 243
    this.firstDate = currentDate
    
    this.socket = socket;
    this.heightLimit = heightLimit;
    this.totalWeeks = totalWeeks;
    this.mWeeks = currentWeekDays;
    this.monthItems = this.state.items.filter((info) => {
      const start = info.start;
      const end = info.end;
      // console.log('l99 start, end', start, end)
      const width = getCourseWidth(start, end, currentDate);
      console.log("monthItems is called")

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
    const start = getDayRange(this.state.current_date, new Date(info.start_date));
    const end = getDayRange(this.state.current_date, new Date(info.end_date)) + 1;
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


    // this broke in the begining of adjusting the code. i dont know how to fix it yet. 
    // totally doable tho. see next change on line 422
    const startDate = findWeekDate(this.state.weekInformation, x, this.props.firstWeek);
    const endDate = findWeekDate(this.state.weekInformation, w + x, this.props.firstWeek);
    const instructor = this.state.instructorArray[Math.floor(y / 2)];

    const start = getCourseWidth(this.props.current_date, startDate);
    const end = getCourseWidth(this.props.current_date, endDate);

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
    // console.log(this.state.items);
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
              // console.log(this.state.items);
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
                  // console.log(this.state.layout);
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
    // console.log(this.state.layout,this.state.heightLimit(),this.props.currentWeekDays,)
    return (
      <ReactGridLayout
        {...props}
        cols={this.props.currentWeekDays}
        maxRows={this.state.heightLimit()}
        layout={this.state.layout}
        isDraggable={ReactSession.get("admin") !== undefined ? true : false}
        isResizable={ReactSession.get("admin") !== undefined ? true : false}
        autoSize={true}
                                                                // just added 'false'   \/   and this  \/ 'this.props.currentWeekDays' next change line 434
      >
        {this.monthItems.map(el => this.createElement(el, el.vid !== undefined ? true : false, this.props.currentWeekDays))} 
      </ReactGridLayout>
    )
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (this.props.weekInformation.weekRangesArray[this.props.currentMonth].month !== prevProps.weekInformation.weekRangesArray[this.props.currentMonth].month) {
  //     this.onLayoutChange(this.itemLayout);
  //   }
  // }
  // changed this as well. just altered if statement to listen for a change in current_date. next change 457
  componentDidUpdate(prevProps, prevState) {
    if (this.props.current_date !== prevProps.current_date) {
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


      const width = getCourseWidth(start, end, this.props.currentDate, this.firstDate); //i change 'width' to be the result of this function i made. same thing on line 468

      if (width === 0) {
        return false;
      }

      return true;
    })


    random.forEach(element => {
      const width = getCourseWidth(element.start, element.end, this.props.currentDate, this.firstDate);//i change 'width' to be the result of this function i made. next change on line 499
      element.data.w = width;
      element.data.i = element.data.i.toString();
      element.data.maxW = this.props.currentWeekDays;
      items.push(element.data);
    });
    this.monthItems = random;
    this.itemLayout = items;

    return items;
  }

  render() {
    return (
      <React.Fragment>
        <TimelineGridWeek
          socket={this.socket}
          heightLimit={this.heightLimit}
          instructorArray={this.state.instructorArray}
          createCourse={this.onAddCourse}
          totalWeeks={this.props.currentWeekDays}
          onRemoveUser={this.onRemoveUser}
          onAddUser={this.onAddUser} />
        <div className="grid-item-container-week" style={{ width: this.props.currentWeekDays * 178, position: "absolute" }}>
          {this.createItemGrid(this.props)}
        </div>
      </React.Fragment>
    );
  }
}
// made this new function. im sure there is a better way. 
function getCourseWidth(start, end, currentDate, firstDate='nothing :D') {
  // monday and friday = how many days they are from jan 3 2022. if the dates for monday and friday are in 2021 they are negative. 
  let [monday, friday] = getMonFri(currentDate, firstDate)
  
  // start and end values are in the same format as monday and friday.
  // course is an incremented array of 'day values'
  const course = _.range(start, end)
  // week is an incremented array of 'day values'
  const week = _.range(monday, friday + 1)

  // console.log('week', week) 
  // console.log(' course', course)
  
  // intersect is an array of all the values the week and course share.
  const intersection = course.filter(value => week.includes(value));
  
  // this counts the array. now you have a width
  return intersection.length
}


// this function gets how many days apart the current view's monday and friday are from jan 3 2022
function getMonFri(currentDate, firstDate) {
  const new_date = new Date(currentDate)
  const monday = new_date.getDate()
  const friday = monday + 4
  
  if ((typeof firstDate !== 'undefined') && (firstDate !== 'nothing :D')){
    let new_monday = getDayRange(firstDate, currentDate)
    let new_friday = getDayRange(firstDate, currentDate) + 4

    return [new_monday, new_friday]
  } else {
    return [monday, friday]
  }

}

// gets the amount of days between two dates
function getDayRange(d1, d2) {
  
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24))
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

function findWeekDate(weekInformation, index, firstDate) {
  return weekInformation.indexMap[index];
}
