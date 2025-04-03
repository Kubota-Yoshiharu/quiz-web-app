import React, { useState, useEffect } from 'react';
import './App.css';
import wordData from './Word.json';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    function getQuestions() {
      const categoryMap = {};
      wordData.forEach((item) => {
        if (!categoryMap[item.区分]) {
          categoryMap[item.区分] = [];
        }
        categoryMap[item.区分].push(item);
      });

      const validItems = wordData.filter((item) => item.英語 !== '-');
      const generated = [];

      validItems.forEach((item) => {
        const sameCat = categoryMap[item.区分] || [];
        const otherChoices = sameCat
          .map((i) => i.意味)
          .filter((m) => m !== item.意味);

        if (otherChoices.length >= 3) {
          const choices = shuffle([...randomSample(otherChoices, 3), item.意味]);
          generated.push({
            question: item.英語,
            answer: item.意味,
            choices
          });
        }
      });

      return shuffle(generated).slice(0, 10);
    }

    function shuffle(arr) {
      return arr.sort(() => Math.random() - 0.5);
    }

    function randomSample(arr, size) {
      const shuffled = shuffle(arr.slice());
      return shuffled.slice(0, size);
    }

    setQuestions(getQuestions());
  }, []);

  function handleSubmit() {
    if (!selectedChoice) return;
    const correct = questions[currentQuestion].answer === selectedChoice;
    if (correct) {
      setScore(score + 1);
    }
    const next = currentQuestion + 1;
    if (next >= questions.length) {
      setShowResult(true);
    } else {
      setCurrentQuestion(next);
    }
    setSelectedChoice('');
  }

  if (showResult) {
    return (
      <div className="App">
        <h2>結果</h2>
        <p>スコア: {score} / {questions.length}</p>
        <p>正答率: {((score / questions.length) * 100).toFixed(2)}%</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="App">読み込み中...</div>;
  }

  const question = questions[currentQuestion];

  return (
    <div className="App">
      <h2>問題 {currentQuestion + 1} / {questions.length}</h2>
      <p>{question.question} の意味は？</p>
      {question.choices.map((choice, idx) => (
        <label key={idx} style={{ display: 'block' }}>
          <input
            type="radio"
            name="choice"
            value={choice}
            checked={selectedChoice === choice}
            onChange={(e) => setSelectedChoice(e.target.value)}
          />
          {choice}
        </label>
      ))}
      <button onClick={handleSubmit}>回答</button>
    </div>
  );
}

export default App;
