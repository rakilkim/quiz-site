import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Spinner from '../components/Spinner'
import Nav from '../components/Nav'
import BackButton from '../components/BackButton'
import { IoIosArrowDroprightCircle } from "react-icons/io";



const Quiz = () => {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState({})
  const [problems, setProblems] = useState([]);
  const [answer, setAnswer] = useState('');
  const [correct, setCorrect] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [probNum, setProbNum] = useState(0);
  const [score, setScore] = useState(0);
  const { id, len } = useParams();
  const navigate = useNavigate();
  const [scoreSet, setScoreSet] = useState();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`https://guessquiz-9c9067408cb5.herokuapp.com/quiz/${id}`)
      .then((response) => {
        setQuiz(response.data);
        setProblems(response.data.questionsUrl.map((e, i) => {
          return [e, response.data.answers[i]];
        }));
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      })
  }, [])

  const handleAnswer = (e) => {
    if (answer) {
      if (e.type == "click" || e.code == "Enter") {
        if (submit) {
          if (probNum + 1 == problems.length) {
            const scoreSet = (problems.length % 10 == 0) ?
              problems.length / 10 - 1
              : 3;
            const copy = quiz;
            copy.scores[scoreSet][score]++;
            setQuiz(copy);
            console.log(copy);
            handleScore(copy);
            navigate(`/quiz/score/${id}/${score}/${problems.length}/${copy.scores[scoreSet]}`);
          }
          setSubmit(false);
          setAnswer('');
          setProbNum(probNum + 1);
        }
        else {
          setSubmit(true);
          if (answer.toLowerCase() == problems[probNum][1]) {
            setCorrect(true);
            setScore(score + 1);
          }
          else {
            setCorrect(false);
          }
        }
      }
    }
  }

  const handleScore = (copy) => {
    setLoading(true);
    axios
      .put(`https://guessquiz-9c9067408cb5.herokuapp.com/quiz/${id}`, copy,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
      .then((response) => {
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      })
  }

  return (
    <div className='flex flex-col h-screen items-center'>
      <div className='w-screen px-8 md:px-36'>
        <Nav />
      </div>
      {loading ? (
        <div>
          <Spinner />
        </div >
      ) : (
        <div>
          <div className='flex flex-col h-full items-center justify-center'>
            <img
              src={problems[probNum][0]}
              className='min-w-64 min-h-64 max-w-96 max-h-96 mt-5' />
            <div className='flex justify-center w-full min-w-80'>
              {submit ? (
                <div className='w-full flex justify-center items-center'>
                  {correct ? (
                    <div className='ml-16 text-2xl text-lime-300'>Correct!</div>
                  ) : (
                    <div className='flex flex-col items-center ml-20'>
                      <span className='text-2xl text-red-400/90'>Wrong!</span>
                      <span className='text-2xl'>Correct Answer: <span className='text-lime-200'>{problems[probNum][1]} </span> </span>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type='text'
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => handleAnswer(e)}
                  placeholder='Guess the image'
                  className='my-14 w-full ml-2 rounded-md
                           focus:outline-none focus:border-2 focus:border-lime-400' />
              )}

              <IoIosArrowDroprightCircle
                onClick={(e) => handleAnswer(e)}
                className='cursor-pointer my-14 ml-10 text-5xl text-lime-500' />
            </div>
          </div>
        </div>
      )}
    </div>

  )
}

export default Quiz
