let score = 0;
let totalQuestions = 0;

async function generateMCQ() {
    const topic = document.getElementById("topicInput").value;
    const quizDiv = document.getElementById("quiz");
    score = 0;

    quizDiv.innerHTML = "Generating quiz...";

    const response = await fetch("https://ai-quiz-generator-zufp.onrender.com/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic })
    });

    const data = await response.json();

    if (data.questions) {
        totalQuestions = data.questions.length;
        renderQuiz(data.questions);
    } else {
        quizDiv.innerHTML = "Error generating quiz.";
    }
}

function renderQuiz(questions) {
    const quizDiv = document.getElementById("quiz");
    quizDiv.innerHTML = "";

    questions.forEach((q, index) => {
        const questionDiv = document.createElement("div");
        questionDiv.className = "question";

        questionDiv.innerHTML = `<h3>${index + 1}. ${q.question}</h3>`;

        q.options.forEach((option, i) => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.innerText = option;

            btn.onclick = function () {
                if (btn.disabled) return;

                if (i === q.answer_index) {
                    btn.classList.add("correct");
                    score++;
                } else {
                    btn.classList.add("wrong");
                }

                highlightCorrect(questionDiv, q.answer_index);
                disableButtons(questionDiv);
                updateScore();
            };

            questionDiv.appendChild(btn);
        });

        quizDiv.appendChild(questionDiv);
    });

    updateScore();
}

function highlightCorrect(container, correctIndex) {
    const buttons = container.querySelectorAll(".option-btn");
    buttons[correctIndex].classList.add("correct");
}

function disableButtons(container) {
    const buttons = container.querySelectorAll(".option-btn");
    buttons.forEach(btn => btn.disabled = true);
}

function updateScore() {
    let scoreBoard = document.getElementById("scoreBoard");

    if (!scoreBoard) {
        scoreBoard = document.createElement("div");
        scoreBoard.id = "scoreBoard";
        scoreBoard.className = "score-board";
        document.getElementById("quiz").prepend(scoreBoard);
    }

    scoreBoard.innerText = `Score: ${score} / ${totalQuestions}`;
}
