window.onload = function () {
    $('#clickToStart').on('click', function () {
        this.style.display = 'none';
        $('.readText').css('display', 'none');
        getQuestions();
    });
}

var intervalId;
var time = 60;
var questions = [];
var rightAnswer, userAnswer, indexOfAnswer;
var choices = [];
var trivia = 'https://opentdb.com/api.php?amount=10';
var currentQuestion = 0;
var numOfQuestions = 10;
var numCorrect = 0;


function getQuestions() {
    $.ajax({
        url: trivia,
        method: "GET",
        success: function (response) {
            console.log(response)
            questions = response.results;
            $('.timer').css('display', 'inline-block');
            $('.question').css('display', 'inline-block');
            displayQuiz();
        }
    })
}

function findAnswer(array, answer) {
    for (let i = 0; i < array.length; i++) {
        if (String(array[i]) == String(answer)) {
            return i;
        }
    }
    console.log('no right answer, please debug');
    console.log(array);
    console.log(`answer is ${answer}`)
    return -1;
}

function displayQuiz() {
    reset();
    choices = [];
    questions[currentQuestion].incorrect_answers.forEach(element => {
        choices.push(element);
    });
    choices.push(questions[currentQuestion].correct_answer);
    rightAnswer = questions[currentQuestion].correct_answer;
    choices = shuffle(choices);
    indexOfAnswer = findAnswer(choices, rightAnswer);
    console.log(`The answer is ${rightAnswer}`);
    $('.question').html(`
        <div><h1>${questions[currentQuestion].question}</h1></div>
    `)
    for (let i = 0; i < choices.length; i++) {
        $('.question').append(`
        <h3 class='answer' value='${i}'>${choices[i]}</h3>
        `)
    }
    timeStart();
}

function outOfTime() {
    currentQuestion++;
    $('.question').html(`
    <div><h1>${questions[currentQuestion - 1].question}</h1></div>
    <h2>Out of Time, Moving on to the next one</h2>
    <h3>The answer is ${rightAnswer}</h3>
    `)
    setTimeout(function () { displayQuiz() }, 5000);
}

$(document).on('click', '.answer', function () {
    timeStop();
    userAnswer = $(this).attr('value');
    currentQuestion++;
    if (userAnswer == indexOfAnswer) {
        console.log('correct');
        numCorrect++;
        displayCorrect(true);
    } else if (userAnswer != indexOfAnswer) {
        console.log('wrong');
        displayCorrect(false);
    }
});

function displayCorrect(gotIt) {
    $('.question').html(`
    <div><h1>${questions[currentQuestion - 1].question}</h1></div>
    <h3>The answer is <div>${rightAnswer}</div></h3>
    `)

    if (gotIt) {
        $('.question').append(`<h1 class='blinkingRight'>Correct</h1>`);
    } else if (!gotIt) {
        $('.question').append(`<h1 class='blinking'>Incorrect</h1>`);
    }

    if (currentQuestion >= numOfQuestions) {
        setTimeout(endScreen(), 3000);
    } else {
        setTimeout(function () { displayQuiz() }, 3000);
    }
}

function endScreen() {
    $('.question').html(`
    <div><h1>Quiz finished</h1></div>
    <h3>Correct Answers: ${numCorrect} Questions Missed:${numOfQuestions - numCorrect}</h3>
    <button type="button" class="btn btn-danger clickToReset">Play Again</button>
    `);
}

$(document).on('click', '.clickToReset', function () {
    resetQ();
});

function resetQ() {
    questions = [];
    time = 60;
    getQuestions();
    currentQuestion = 0;
    choices = [];
    numCorrect = 0;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function timeStart() {
    intervalId = setInterval(count, 1000);
}

function timeStop() {
    clearInterval(intervalId);
}

function reset() {
    time = 60;
    $('#display').html(`<p class='display'>01:00</p>`);
}

function timeConverter(t) {
    var minutes = Math.floor(t / 60);
    var seconds = t - (minutes * 60);

    if (seconds < 10) {
        seconds = '0' + seconds;
    }

    if (minutes === 0) {
        minutes = '00';
    } else if (minutes < 10) {
        minutes = '0' + minutes;
    }

    return minutes + ':' + seconds;
}

function count() {
    time--;
    var converted = timeConverter(time);
    $('#display').html(`<p class='display'>${converted}</p>`);
    if (time <= 0) {
        timeStop();
        outOfTime();
    }
}