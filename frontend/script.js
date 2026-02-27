let score = 0;
let totalQuestions = 0;
let answeredQuestions = 0;

async function generateMCQ() {
    const topic = document.getElementById("topicInput").value.trim();
    const quizDiv = document.getElementById("quiz");

    score = 0;
    totalQuestions = 0;
    answeredQuestions = 0;
    updateStats();

    if (!topic) {
        quizDiv.innerHTML = '<p class="error-message">Please enter a topic before generating a quiz.</p>';
        return;
    }

    quizDiv.innerHTML = '<div class="loading-state"><span class="loading-dot" aria-hidden="true"></span>Generating quiz...</div>';

    try {
        const response = await fetch("https://ai-quiz-generator-zufp.onrender.com/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic })
        });

        if (!response.ok) {
            throw new Error("Request failed");
        }

        const data = await response.json();

        if (data.questions && data.questions.length) {
            totalQuestions = data.questions.length;
            answeredQuestions = 0;
            renderQuiz(data.questions);
        } else {
            quizDiv.innerHTML = '<p class="error-message">No quiz data received. Please try another topic.</p>';
            updateStats();
        }
    } catch (error) {
        quizDiv.innerHTML = '<p class="error-message">Error generating quiz. Please try again.</p>';
        updateStats();
    }
}

function renderQuiz(questions) {
    const quizDiv = document.getElementById("quiz");
    quizDiv.innerHTML = "";

    questions.forEach((q, index) => {
        const questionDiv = document.createElement("article");
        questionDiv.className = "question";

        questionDiv.innerHTML = `<h3>${index + 1}. ${q.question}</h3>`;

        q.options.forEach((option, i) => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.type = "button";
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
                answeredQuestions++;
                updateStats(true);
            };

            questionDiv.appendChild(btn);
        });

        quizDiv.appendChild(questionDiv);
    });

    updateStats();
}

function highlightCorrect(container, correctIndex) {
    const buttons = container.querySelectorAll(".option-btn");
    if (buttons[correctIndex]) {
        buttons[correctIndex].classList.add("correct");
    }
}

function disableButtons(container) {
    const buttons = container.querySelectorAll(".option-btn");
    buttons.forEach((btn) => {
        btn.disabled = true;
    });
}

function updateStats(animateScore = false) {
    const scoreBoard = document.getElementById("scoreBoard");
    const progressWrap = document.getElementById("progressWrap");
    const progressFill = document.getElementById("progressFill");
    const progressLabel = document.getElementById("progressLabel");

    scoreBoard.innerText = `Score: ${score} / ${totalQuestions}`;

    const completion = totalQuestions ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
    progressFill.style.width = `${completion}%`;
    progressLabel.innerText = `${completion}% completed`;
    progressWrap.classList.toggle("is-hidden", totalQuestions === 0);

    const quizCompleted = totalQuestions > 0 && answeredQuestions === totalQuestions;
    scoreBoard.classList.toggle("is-hidden", !quizCompleted);

    if (animateScore && quizCompleted) {
        scoreBoard.classList.remove("score-pop");
        void scoreBoard.offsetWidth;
        scoreBoard.classList.add("score-pop");
    }
}

updateStats();
