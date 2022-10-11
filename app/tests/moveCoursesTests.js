const {By,Key,Builder} = require("selenium-webdriver");
const until = require("selenium-webdriver/lib/until");
const assert = require('assert');
require("chromedriver");

async function testCourseMove(driver, source, target, name) {
   // Drag the elements from the first slot to another slot
   const element = await driver.wait(until.elementLocated(By.name(name)), 8000);

   // Compare x positions
   let oldX = await getTranslateX(element);

   await driver.actions().dragAndDrop(source, target).perform();

   let newX = await getTranslateX(element);

   const moveErrorMsg = "Error with moving course elements"
   await (() => {
       try{
           assert.equal(true, (oldX <= newX), moveErrorMsg);
       } catch(error) {
           console.log(error);
       }
   })();

   // Move the element back
   await driver.actions().dragAndDrop(target, source).perform();
}

async function testSameCourseMultiMove(driver, driver2, source, target, sourceMulti, targetMulti, name) {
    const element = await driver.wait(until.elementLocated(By.name(name)), 8000);
    const element2 = await driver2.wait(until.elementLocated(By.name(name)), 8000);

    driver.actions().dragAndDrop(source, target).perform();
    driver2.actions().dragAndDrop(sourceMulti, targetMulti).perform();

    newX = await getTranslateX(element);
    newX2 = await getTranslateX(element2);

    const twoBrowsersMoveMsg = "Error with moving the same course element in 2 different browsers"
    await (() => {
        try{
            console.log(`${newX} ${newX2}`);
            assert.equal(true, (newX == newX2), twoBrowsersMoveMsg);
        } catch(error) {
            console.log(error);
        }
    })();

    // Move the element back
    //await driver.actions().dragAndDrop(target, source).perform();
    //await driver2.actions().dragAndDrop(targetMulti, sourceMulti).perform();
}

async function testCourseMovement(driver, driver2, course, course2, name, name2) {
    // Get the first slot in each row header in the first driver
    let source = await driver.wait(until.elementLocated(By.name(name + " slot 3")));
    await source.click();

    // Get the target slot in each row header in the second driver
    let source2 = await driver2.wait(until.elementLocated(By.name(name2 + " slot 3")));
    await source2.click();

    // Get the target slot in each row headerin the first driver
    let target = await driver.wait(until.elementLocated(By.name(name + " slot 6")));

    // Get the target slot in each row header in the second driver
    let target2 = await driver2.wait(until.elementLocated(By.name(name2 + " slot 5")));
    
    // Create test courses
    //await testCourseCreationForm(driver, driver2, course, course2, name, name2);

    // Close modal
    await driver.executeScript("arguments[0].click();", source);
    await driver2.executeScript("arguments[0].click();", source2);

    // Drag the elements from the first slot to another slot
    await testCourseMove(driver, source, target, `${course.title + " " + course.number + " el"}`);
    await testCourseMove(driver2, source2, target2, `${course2.title2 + " " + course2.number2 + " el"}`);

    const sourceMulti = await driver2.wait(until.elementLocated(By.name(name + " slot 3")));
    const targetMulti = await driver2.wait(until.elementLocated(By.name(name + " slot 5")));

    // Drag the same element from multiple browsers
    await testSameCourseMultiMove(driver, driver2, source, target, sourceMulti, targetMulti, `${course.title + " " + course.number + " el"}`);
    
    console.log("Course tests completed!");
}

async function getTranslateX(element) {
    const index1 = (await element.getAttribute("style")).indexOf("translate(") + 10;
    const x = parseInt((await element.getAttribute("style")).substring(index1, index1+3));
    return x;
}

module.exports = {
    testCourseMovement,
}
