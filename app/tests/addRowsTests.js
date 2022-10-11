const {By,Key,Builder} = require("selenium-webdriver");
const until = require("selenium-webdriver/lib/until");
const assert = require('assert');
const { TIMEOUT } = require("dns");
const { threadId } = require("worker_threads");
require("chromedriver");

async function FillUserInfo(driver, fname, lname, email, pass) {
    const el = await driver.wait(until.elementLocated(By.name('addRowBtn')));
    await el.click();

    const usernameInput = await driver.wait(until.elementLocated(By.name('Username input')));
    usernameInput.sendKeys(fname + " " + lname);

    const firstnameInput = await driver.wait(until.elementLocated(By.name('First Name input')));
    firstnameInput.sendKeys(fname);

    const lastnameInput = await driver.wait(until.elementLocated(By.name('Last Name input')));
    lastnameInput.sendKeys(lname);

    const emailInput = await driver.wait(until.elementLocated(By.name('Email input')));
    emailInput.sendKeys(email);

    const passInput = await driver.wait(until.elementLocated(By.name('Password input')));
    passInput.sendKeys(pass);
}

async function testTwoAddRow(driver, driver2, {fname, lname, email, pass}, {fname2, lname2, email2, pass2}) {
    // Fill out form data
    await FillUserInfo(driver, fname, lname, email, pass);
    await FillUserInfo(driver2, fname2, lname2, email2, pass2);

    // Find the submit button
    const submitUser = await driver.wait(until.elementLocated(By.name('user button')));
    const submitUser2 = await driver2.wait(until.elementLocated(By.name('user button')));

    submitUser.click();

    // Wait for the user to be sent over
    await driver.sleep(500);
    await driver2.sleep(500);

    submitUser2.click();

    // Wait for elements to be generated
    await driver.sleep(1000);
    await driver2.sleep(1000);

    // Remove buttons are associated with each user, find dupliates
    const removeBtnList = await driver.wait(until.elementsLocated(By.name(`${fname + " " + lname + " remove"}`)), 8000);
    const removeBtnList2 = await driver2.wait(until.elementsLocated(By.name(`${fname2 + " " + lname2 + " remove"}`)), 5000);

    // Check if user was correctly sent over to the other browser
    const removeBtnList3 = await driver.wait(until.elementsLocated(By.name(`${fname2 + " " + lname2 + " remove"}`)), 8000);
    const removeBtnList4 = await driver2.wait(until.elementsLocated(By.name(`${fname + " " + lname + " remove"}`)), 5000);

    console.log(removeBtnList.length);
    console.log(removeBtnList2.length);
    const dupeUser = "Error with creating user, 2 of the same user appears in the timeline.";
    const userNotSent = "Error with users sent.";

    await (() => {
        try{
            assert.equal(1, removeBtnList.length, dupeUser);
            assert.equal(1, removeBtnList2.length, dupeUser);
            assert.equal(1, removeBtnList3.length, userNotSent);
            assert.equal(1, removeBtnList4.length, userNotSent);
        } catch(error) {
            console.log(error);
        }
    });

    // Close modal
    const el = await driver.wait(until.elementLocated(By.name('addRowBtn')));
    await driver.executeScript("arguments[0].click();", el);

    const el2 = await driver2.wait(until.elementLocated(By.name('addRowBtn')));
    await driver2.executeScript("arguments[0].click();", el2);
    console.log("Tests completed!");

    // driver.quit();
    // driver2.quit();
}

module.exports = {
    testTwoAddRow
}

//testTwoAddRow();