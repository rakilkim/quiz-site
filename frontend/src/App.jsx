import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Quiz from './pages/Quiz'
import QuizInfo from './pages/QuizInfo'
import CreateQuiz from './pages/CreateQuiz'
import EditQuiz from './pages/EditQuiz'
import Score from './pages/Score'
import Profile from './pages/Profile'



const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/quiz/register' element={<Register />} />
      <Route path='/quiz/login' element={<Login />} />
      <Route path='/quiz/:id/:len' element={<Quiz />} />
      <Route path='/quizinfo/:id' element={<QuizInfo />} />
      <Route path='/quiz/create' element={<CreateQuiz />} />
      <Route path='/quiz/edit/:id' element={<EditQuiz />} />
      <Route path='/quiz/score/:id/:score/:len/:scores' element={<Score /> } />
      <Route path='/profile/:uid' element={<Profile />} />
    </Routes>
  )
}

export default App