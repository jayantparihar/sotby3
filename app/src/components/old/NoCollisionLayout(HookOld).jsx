import React from "react";
import { useState } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import _ from "lodash";
import ElementInput from "../ElemenInput";
const ReactGridLayout = WidthProvider(RGL);

export default function LocalStorageLayout({props, socket, heightLimit}) {
  const defaultProps = {
    className: "layout",
    cols: 25,
    rowHeight: 100,
    margin: [2, 2],
    onLayoutChange: function() {},
    preventCollision: true,
    resizeHandles: ['e'],
    compactType: null,
    autoSize: true
    // isBounded: true,
  };

  // this.state = {
  //   items: ["MATH", "ENGLISH", "STATS", "HISTORY", "PHYSICS"].map(function(i, key, list) {
  //     console.log(i + key);
  //     return {
  //       text: i,
  //       data: {
  //         i: i + key,
  //         x: key * 2,
  //         y: 0,
  //         w: 2,
  //         h: 1,
  //       }
  //     };
  //   }),
  //   //layout: JSON.parse(JSON.stringify(originalLayout)),
  //   newCounter: 0,
  //   heightLimit: heightLimit
  // };
  const [items, setItems] = useState(
    ["MATH", "ENGLISH", "STATS", "HISTORY", "PHYSICS"].map(function(i, key, list) {
        console.log(i + key);
        return {
          text: i,
          data: {
            i: i + key,
            x: key * 2,
            y: 0,
            w: 2,
            h: 1,
          }
        };
  }));
  const [counter, setCounter] = useState(0);
  //const [heightLimit, setHeightLimit] = useState(heightLimit);
  const [layout, setLayout] = useState([]);


  // this.onLayoutChange = this.onLayoutChange.bind(this);
  // this.resetLayout = this.resetLayout.bind(this);
  // this.socket = socket;

  //this.onAddItem = this.onAddItem.bind(this);

  socket.on("itemChanged", (item) => {
    console.log("Item Received: " + JSON.stringify(item));

    for(let i = 0; i < layout.length; i++) {
      if(layout[i].i == item.i) {
        //const newLayout = JSON.parse(JSON.stringify(this.state.layout));
        const newLayout = layout.slice();
        newLayout[i] = item;

        console.log(layout);
        console.log(newLayout);
        // this.setState({
        //   layout: newLayout
        // });
        setLayout(newLayout);
        break;
      }
    }
  });

  const resetLayout = () => {
    // this.setState({
    //   layout: [],
    // });
    setLayout([]);
  }

  const onLayoutChange = (layout) => {
    //this.setState({ layout });
    setLayout({layout});

    onLayoutChange(layout); // updates status display
    console.log("layout changed");
  }

  const onItemChange = (layout, oldItem, newItem, placeholder, e, element) => {
    /*
    console.log("Layout:" + JSON.stringify(layout));
    console.log("Old Item: " + JSON.stringify(oldItem));
    console.log("New Item: " + JSON.stringify(newItem));
    console.log("PlaceHolder: " + JSON.stringify(placeholder));
    console.log("MouseEvent: " + e);
    console.log(layout.indexOf(newItem));
    console.log("Layout Index: " + this.layout)*/

    socket.emit('itemChanged', newItem);

    
    console.log("item Changed");
    console.log("New Item: " + JSON.stringify(newItem));
    const index = _.findIndex(items, (element) => {return element.data.i == newItem.i});
    const newItems = items.slice();
    const foundItem = items[index];
    foundItem.data.h = newItem.h;
    foundItem.data.w = newItem.w;
    foundItem.data.x = newItem.x;
    foundItem.data.y = newItem.y;
    newItems.splice(index, 1, foundItem);
    //console.log("Found Item: " + JSON.stringify(this.state.items[index]));
    //console.log("NewItems: " +JSON.stringify(newItems));
    setItems({items: newItems});
    //console.log("New Items State: " + JSON.stringify(this.state.items));
  }

  const onAddItem = (text, x=0, y=0, w=3) => {
    console.log("adding", "n" + counter);
    setItems(
      items.concat({
        text: text,
        data:{
          i: text + counter,
          x: x,
          y: y, 
          w: w,
          h: 1,
        }
      })
    );
    // Increment the counter to ensure key is always unique.
    // newCounter: this.state.newCounter + 1
    setCounter(counter + 1);
  }

  const onRemoveItem = (i) => {
    console.log("removing", i);
    console.log(JSON.stringify(layout));
    //this.setState({ layout: this.state.layout.filter((element) => element.i != i) });
    setItems(_.reject(items, (element) => {return element.data.i == i}));
    console.log(JSON.stringify(layout));
    
  }

  const createElement = (el) => {
    const removeStyle = {
      position: "absolute",
      right: "2px",
      top: 0,
      cursor: "pointer",
      padding: "5px",
    };
    const i = el.i;

    // TODO: Figure out how to programmatically reset elements that are over the height limit, solution needs setState to update the DOM
    // const currentHeightLimit = this.state.heightLimit();
    // console.log("el.data.y: " + JSON.stringify(el.data.y) + ", Height: " + currentHeightLimit);

    // if(el.data.y > currentHeightLimit) {
    //   el.data.y = currentHeightLimit;
    //   console.log("el.data.y after: " + el.data.y);
    // } 

    return (
      <div key={el.data.i} data-grid={el.data}>
        <span className="text">{el.text}</span>
        <span
          className="remove"
          style={removeStyle}
          onClick={() => {onRemoveItem(el.data.i)}}
        >
          x
        </span>
      </div>
    );
  }

  return (
    <div>
      <button onClick={resetLayout} style={{position: "sticky", zIndex: 99}}>Reset Layout</button>
      <ElementInput text={"Add Element: "} callBack={(text) => onAddItem(text)}/>
      <ReactGridLayout
        {...defaultProps}
        maxRows={heightLimit()}
        layout={layout}
        onLayoutChange={onLayoutChange}
        onDragStop= {onItemChange}
        onResizeStop = {onItemChange}
      >
        {items.map(el => createElement(el))}
        {/* <div key="grid-limit" data-grid={{ w: 1, h: this.state.heightLimit(), x: 1, y: 6, static:true}}>
          <span className="text">HEIGHT LIMIT</span>
        </div> */}

      </ReactGridLayout>
    </div>
  );
}

// function getFromLS(key) {
//   let ls = {};
//   if (global.localStorage) {
//     try {
//       ls = JSON.parse(global.localStorage.getItem("rgl-7")) || {};
//     } catch (e) {
//       /*Ignore*/
//     }
//   }
//   return ls[key];
// }

// function saveToLS(key, value) {
//   if (global.localStorage) {
//     global.localStorage.setItem(
//       "rgl-7",
//       JSON.stringify({
//         [key]: value
//       })
//     );
//   }
// }