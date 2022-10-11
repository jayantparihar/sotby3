const {By,Key,Builder} = require("selenium-webdriver");
const until = require("selenium-webdriver/lib/until");
const assert = require('assert');
require("chromedriver");

async function FillCourseInfo(driver, number, subject, course, title, length, color) {
    const numberInput = await driver.wait(until.elementLocated(By.name('Number input')));
    numberInput.sendKeys(number);

    const subjectInput = await driver.wait(until.elementLocated(By.name('Subject input')));
    subjectInput.sendKeys(subject);

    const courseInput = await driver.wait(until.elementLocated(By.name('Course input')));
    courseInput.sendKeys(course);

    const titleInput = await driver.wait(until.elementLocated(By.name('Title input')));
    titleInput.sendKeys(title);

    const lengthInput = await driver.wait(until.elementLocated(By.name('Week Length input')));
    lengthInput.sendKeys(length);

    const colorInput = await driver.wait(until.elementLocated(By.name('Color input')));
    colorInput.sendKeys(color);
}

async function testCourseCreationForm(driver, driver2, {number, subject, course, title, length, color}, {number2, subject2, course2, title2, length2, color2}) {
    console.log(number);
    // Fill out form data
    await FillCourseInfo(driver, number, subject, course, title, length, color);
    await FillCourseInfo(driver2, number2, subject2, course2, title2, length2, color2);

    // Find the submit button
    const submitCourse = await driver.wait(until.elementLocated(By.name('course button')), 8000);
    const submitCourse2 = await driver2.wait(until.elementLocated(By.name('course button')), 10000);

    submitCourse.click();

    // Generate a delay as a temporary measure to prevent different ordering of users in multiple browsers
    await driver2.sleep(100);

    submitCourse2.click();

    // Wait for elements to be generated
    await driver.sleep(1000);
    await driver2.sleep(1000);

    // Find the course elements created
    const elementList = await driver.wait(until.elementsLocated(By.name(`${title + " " + number + " el"}`)), 8000);
    const elementList2 = await driver2.wait(until.elementsLocated(By.name(`${title2 + " " + number2 + " el"}`)), 10000);

    // Check if course info was correctly sent over to the other browser
    const elementList3 = await driver.wait(until.elementsLocated(By.name(`${title2 + " " + number2 + " el"}`)), 8000);
    const elementList4 = await driver2.wait(until.elementsLocated(By.name(`${title + " " + number + " el"}`)), 10000);

    console.log(elementList.length);
    console.log(elementList2.length);
    const dupeCourse = "Error with creating a course";
    const courseNotSent = "Error with course sent through a socket.";

    // Test the courses has been created and that it has been sent to the other browser
    await (() => {
        try{
            assert.equal(1, elementList.length, dupeCourse);
            assert.equal(1, elementList2.length, dupeCourse);
            assert.equal(1, elementList3.length, courseNotSent);
            assert.equal(1, elementList4.length, courseNotSent);
        } catch(error) {
            console.error(error);
        }
    })();
}

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

async function testCreateCourse(driver, driver2, course, course2, name, name2) {
    // Get the first slot in the first driver
    console.log(name);
    console.log(name2);

    let source = await driver.wait(until.elementLocated(By.name(name + " slot 3")));
    await source.click();

    // Get the target slot in the second driver
    let source2 = await driver2.wait(until.elementLocated(By.name(name2 + " slot 3")));
    await source2.click();

    await testCourseCreationForm(driver, driver2, course, course2, name, name2);

    // Close modal, executing a click outside of the modal closes it
    await driver.executeScript("arguments[0].click();", source);
    await driver2.executeScript("arguments[0].click();", source2);

    console.log("Course creation testing completed!");
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
    testCreateCourse
}
