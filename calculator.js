/* 

  * v 1.2
  * completed functionality: 
    - update main and temp display,
    - equal executes evalutaion,
    - keyboard setup,
    - all functions work (backspace, dot, negation, correct, correctLast)

  * functionality to consider:
    - expand display input height / lower font for larger equations,
    - buttons working with keypress,
    - add more complex math functions,
    - add brackets (evaluation order),
    - refactor project into OOP,
    - set precision,
    - procents,
    - add currency calc,
    - measurements calc,
    - rewrite buttons with data-action + event delegation pattern,
    - use .include() on strings to implement brackets,
    - animate mouseout on buttons,
    - animate each display iteration,
    - animate steps and steps display,
    - animate display instead replecing whole input value,
    - add generated particles (arguments) from random sides of screen flaying accros background

*/


const tmpDisplay = document.getElementById(`display-tmp`);
const mainDisplay = document.getElementById(`display-main`);
const steps = document.getElementById(`steps`);
const stepsTitle = document.getElementById(`current-evaluation`);
const history = document.getElementById(`history`);

let calc = [];
let tmpValue = tmpDisplay.value;
let result = 0;
let isOperation = false;
let isEvaluated = false;
let isDecimal = false;
let isNegative = false;
let delCount = 0;

function cl(content) {
    return console.log(content);
}

function correct() {
    mainDisplay.value = 0;
    tmpDisplay.value = 0;
    clearDisplay(`history`);
    clearDisplay(`steps`);
    stepsTitle.innerHTML = ``;
    calc = [];
    result = 0;
    delCount = 0;
    isEvaluated = false;
    isDecimal = false;
    isNegative = false;
}

function correctLast() {
    tmpDisplay.value = 0;
}

function dot() {
  if(!isDecimal) {
    tmpDisplay.value += `.`;
    isDecimal = true;
  }
}

function negation() {
  if(tmpDisplay.value == 0) {
    return null;
  } else if(tmpDisplay.value != 0 && !isNegative) {
    tmpDisplay.value = `-${tmpDisplay.value}`;
    isNegative = true;
  } else {
    let negationArr = tmpDisplay.value.split(``);
    negationArr.shift();
    tmpDisplay.value = negationArr.join(``);
    isNegative = false;
  }
}

function backspc() {
  let currentValue = tmpDisplay.value.split(``);
  if((tmpDisplay.value > 0 && currentValue.length > 1 ||
      tmpDisplay.value < 0 && currentValue.length > 2)) {
    currentValue.pop();
    tmpDisplay.value = currentValue.join(``);
  } else if((tmpDisplay.value > 0 && currentValue.length == 1) || 
            (tmpDisplay.value < 0 && currentValue.length == 2)) {
    tmpDisplay.value = 0;
  }
}

function num(arg) {
    // check if equal sign (=) was pressed
    if (arg != `=`) {

        // check if display value AND arg = 0 
        if (arg == 0 && tmpDisplay.value == 0) {
            return null;
        } else {

            if(isNaN(arg)) {
                // if operation sign
                // set boolean back to false
                isOperation = true;
                if(isEvaluated && mainDisplay != 0 && tmpDisplay.value == 0) {
                    mainDisplay.value += ` ${arg} `;
                    isEvaluated = false;
                } else if(mainDisplay.value == 0 || isEvaluated) {
                    mainDisplay.value = `${tmpDisplay.value} ${arg} `;
                    isEvaluated = false;
                } else {
                    mainDisplay.value += `${tmpDisplay.value} ${arg} `;
                }

            } else {
                // if arg is number
                // first entry -> replace value / reset isOperation & isDecimal to default (false)
                if(tmpDisplay.value == 0 || isOperation) {
                    tmpDisplay.value = arg;
                    isOperation = false;
                    isDecimal = false;
                } else if(tmpDisplay.value != 0 && !isOperation) {
                    tmpDisplay.value += arg;
                }

            } 
        }

    } else {

        // if equal sign (=) was pressed evaluate equation

        // split main display value into array
        calc = mainDisplay.value.split(` `);

        // check if any elements of array are blank and remove it
        for (let i = 0; i < calc.length; i++) {
            if (calc[i] == ``) { calc.splice(i, 1); }
        }

        // check if last element of array is an operation sign and add temp display value as last to the equation
        if (isNaN(calc[calc.length-1])) {
            calc.push(tmpDisplay.value);
        }
                        
        // check order of operations - create variable with count of each operation in evaluation
        // if count for 1st order operations is 0 than 2nd order operation can be evaluated

        let multiplication = 0, division = 0;

        for (let i = 0; i < calc.length; i++) {
            if (i%2 == 1) {
                switch (calc[i]) {
                    case `x`: multiplication++;
                    break;
                    case `/`: division++;
                    break;
                }
            }
        }

        // add new equation to step display header and reset displayed steps
        let currentEvaluation = calc.join(` `);
        stepsTitle.innerHTML = currentEvaluation;
        steps.innerHTML = ``;
        let stepCount = 0;

        // finally evaluate calc[] array
        // condition:: keep looking for calculations until isEvaluation is true
        while (!isEvaluated) {

            stepCount++;
            for (let i = 0; i < calc.length; i++) {

                // every odd index of calc array will hold operation sign
                if (i%2 == 1) {
                    if (calc[i] == `x`) {
                        multiplication--;
                        result = parseFloat(calc[i-1]) * parseFloat(calc[i+1]);
                        createStep(stepCount, [`step`,`hidden`], `Multiplication: ${calc[i-1]} ${calc[i]} ${calc[i+1]} = <strong>${result}</strong>`);
                        calc.splice(i-1, 3, result.toString());
                        break;
                    } else if (calc[i] == `/`) {
                        division--;
                        result = parseFloat(calc[i-1]) / parseFloat(calc[i+1]);
                        createStep(stepCount, [`step`,`hidden`], `Division: ${calc[i-1]} ${calc[i]} ${calc[i+1]} = <strong>${result}</strong>`);
                        calc.splice(i-1, 3, result.toString());
                        break;
                    } else if (calc[i] == `+` && multiplication == 0 && division == 0) { 
                        result = parseFloat(calc[i-1]) + parseFloat(calc[i+1]);
                        createStep(stepCount, [`step`,`hidden`], `Addition: ${calc[i-1]} ${calc[i]} ${calc[i+1]} = <strong>${result}</strong>`);
                        calc.splice(i-1, 3, result.toString());
                        break;
                    } else if (calc[i] == `-` && multiplication == 0 && division == 0) {  
                        result = parseFloat(calc[i-1]) - parseFloat(calc[i+1]);
                        createStep(stepCount, [`step`,`hidden`], `Substraction: ${calc[i-1]} ${calc[i]} ${calc[i+1]} = <strong>${result}</strong>`);
                        calc.splice(i-1, 3, result.toString());
                        break;
                    }
                }
            }

            // when whole array is evaluated set condition to end while loop
            if (calc.length == 1) {
                isEvaluated = true;
            }
        }
        
        // when all calculation is finished / calc array has only 1 element - display result
        mainDisplay.value = result;
        tmpDisplay.value = 0;
        createStep(`Result`, [`step`,`total`,`hidden`], `<strong>${result}</strong>`);
        let today = new Date();
        let currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        createHistoryEntry(currentTime, currentEvaluation, result);

        setTimeout(() => { 
            displaySteps(); 
        }, 200);
        setTimeout(() => { 
            displayHistory(); 
        }, 400);
    }
}

document.addEventListener(`keydown`, keyboardSetup);

function keyboardSetup(e) {
    let key = e.key;

    switch(key) {
        case `1`: num(1); break;
        case `2`: num(2); break;
        case `3`: num(3); break;
        case `4`: num(4); break;
        case `5`: num(5); break;
        case `6`: num(6); break;
        case `7`: num(7); break;
        case `8`: num(8); break;
        case `9`: num(9); break;
        case `0`: num(0); break;
        case `*`: num(`x`); break;
        case `x`: num(`x`); break;
        case `/`: num(`/`); break;
        case `+`: num(`+`); break;
        case `-`: num(`-`); break;
        case `=`: num(`=`); break;
        case `Enter`: num(`=`); break;
        case `.`: dot(); break;
        case `,`: dot(); break;
        case `n`: negation(); break;
        case `Backspace`: backspc(); break;

        // if Delete pressed twice than clear display
        case `Delete`: (delCount < 1) ? correctLast() : correct(); delCount++; break;
        case `c`: correct(); break;
    }
}

// history

function createStep(stepCount, classNames, content) {
  let p = document.createElement(`P`);
  
  for (let i = 0; i < classNames.length; i++) {
    p.classList.add(classNames[i]);
  }

  p.innerHTML = (isNaN(stepCount)) ? `${stepCount} = ${content}` : `Step ${stepCount}. ${content}`;
  steps.appendChild(p);
}

function createHistoryEntry(timeStamp, evaluation, result) {
    let p = document.createElement(`P`);
    p.classList.add(`history-entry`,`hidden`);
    p.innerHTML = `<span class="history-entry-time">${timeStamp}</span>${evaluation} = <strong>${result}</strong>`;
    history.appendChild(p);
}

// animations 

function displaySteps() {
    let steps = document.getElementsByClassName(`step`);

    let timeout = 100;
    let start = 0;
    for (let i = 0; i < steps.length; i++) {
        setTimeout(() => {
            steps[i].classList.remove(`hidden`);
        }, start += timeout);
    }
}

function displayHistory() {
    let history = document.getElementById(`history`).children;

    if(history.length > 0) {
        for(let i = 0; i < history.length; i++) {
            setTimeout(() => {
                history[i].classList.remove(`hidden`);
            }, 100);
        }
    }
}

function clearDisplay(displayID) {
    
    let display = document.getElementById(displayID).childNodes;    
    let timeout = 10;
    let start = 0;
    
    display.forEach((el) => {
        setTimeout(() => {
            el.classList.add(`hidden`);
        }, start += timeout);
    });
    
    clearDisplayEntries(displayID);
    
}

function clearDisplayEntries(display) {
    setTimeout(() => {
        switch(display) {
            case `history`: history.innerHTML = ``;
            break;
            case `steps`: steps.innerHTML = ``;
            break;
        }
    }, 500);
}
