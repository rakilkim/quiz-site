import React from 'react'
import { useNavigate } from 'react-router-dom'

const Nav = () => {
  const navigate = useNavigate()
  return (
      <h1 
        className='select-none cursor-pointer text-3xl mt-4 mb-8 text-white font-mono
                   w-fit hover:text-lime-300 duration-300'
        onClick={() => navigate('/') }
        >Quizzes</h1>
  )
}

export default Nav