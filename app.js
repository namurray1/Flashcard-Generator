var inquirer = require("inquirer");
var fs = require("fs");
var json = require("./app.json");
var card1;
var currentCard;
var count = 0;
var Promise = require("promise");


function ClozeCardPrototype() {
    this.print = function() {
        console.log(`${this.text[0]}${this.cloze}${this.text[1]}`);
    };
    this.partial = function() {
        return `${this.text[0]} ... ${this.text[1]}`;
    };
    this.cloze = function() {
        return this.cloze;
    };
}

var closeCardPrototype = new ClozeCardPrototype();

function BasicCard(front, back) {
    this.front = front;
    this.back = back;

}

function ClozeCard(text, cloze) {
    this.text = text.split(cloze);
    this.cloze = cloze;

}

var clozeCard = new ClozeCard("testing", "test");

ClozeCard.prototype = new ClozeCardPrototype();

function makeCard() {
    inquirer.prompt([{
            type: "list",
            message: "What kind of flashcard do you want to make?",
            choices: ["Basic Card", "Cloze Card"],
            name: "cardType"
        }

    ]).then(function(myData) {

        var cardType = myData.cardType;
        console.log(cardType);

        if (cardType === "Basic Card") {
            inquirer.prompt([{
                    type: "input",
                    message: "What is your question?",
                    name: "front"
                },

                {
                    type: "input",
                    message: "What is the answer?",
                    name: "back"
                }

            ]).then(function(cardData) {

                var obj = {
                    type: "BasicCard",
                    front: cardData.front,
                    back: cardData.back
                };
                json.push(obj);
                fs.writeFile("app.json", JSON.stringify(json, null, 2));
                inquirer.prompt([{
                        type: "list",
                        message: "Do you want to make another card?",
                        choices: ["Yes", "No"],
                        name: "nextCard"
                    }

                ]).then(function(myData) {
                    if (myData.nextCard === "Yes") {
                        makeCard();
                    } else {
                        return;
                    }
                });
            });

        } else {
            inquirer.prompt([{
                    type: "input",
                    message: "What is the text?",
                    name: "text"
                },

                {
                    type: "input",
                    message: "What is the cloze-deleted portion?",
                    name: "cloze"
                }

            ]).then(function(cardData) {

                var obj = {
                    type: "ClozeCard",
                    text: cardData.text,
                    cloze: cardData.cloze
                };
                if (obj.text.indexOf(obj.cloze) !== -1) {
                    json.push(obj);
                    fs.writeFile("app.json", JSON.stringify(json, null, 2));
                } else {
                    console.log("The text must contain the cloze. Try again!");
                }
                inquirer.prompt([{
                        type: "list",
                        message: "Do you want to make another card?",
                        choices: ["Yes", "No"],
                        name: "nextCard"
                    }

                ]).then(function(myData) {
                    if (myData.nextCard === "Yes") {
                        makeCard();
                    } else {
                        return;
                    }
                });
            });
        }

    });
}

function getQuestion(card) {
    if (card.type === "BasicCard") {
        card1 = new BasicCard(card.front, card.back);
        return card1.front;
    } else if (card.type === "ClozeCard") {
        card1 = new ClozeCard(card.text, card.cloze);
        return card1.partial();
    }
}

function askQuestion() {
    if (count < json.length) {
        currentCard = getQuestion(json[count]);
        inquirer.prompt([{
            type: "input",
            message: currentCard,
            name: "question"
        }]).then(function(answer) {
            if (answer.question === json[count].back || answer.question === json[count].cloze) {
                console.log("You are correct.");
            } else {
                if (card1.front !== undefined) {
                    console.log("The correct answer was " + json[count].back + ".");
                } else {
                    console.log("The correct answer was " + json[count].cloze + ".");
                }
            }
            count++;
            askQuestion();
        });
    }
}

inquirer.prompt([{
    type: "list",
    message: "Do you want to make or use flash cards?",
    choices: ["Make", "Use"],
    name: "useOrMake"
}]).then(function(answer) {
    if (answer.useOrMake === "Make") {
        makeCard();
    } else {
        askQuestion();
    }
});
