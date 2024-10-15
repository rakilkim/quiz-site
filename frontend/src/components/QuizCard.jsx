import React from 'react'
import { Link } from 'react-router-dom'
import { AiOutlineEdit } from 'react-icons/ai'
import { MdOutlineDelete } from 'react-icons/md'

const QuizCard = ({ id, name, len, creator, description, image }) => {
    return (
        <div className='flex relative basis-0 shrink grow flex-col sm:p-2 sm:m-4 p-1 m-1 
        min-w-52 max-w-64 w-64 h-80 rounded-2xl bg-lime-500 shadow-xl
        hover:scale-105 duration-150'>
            <div className='flex justify-center'>
                <img src={`${image}`} alt='quiz' className='h-44 w-full rounded-md' />
            </div>
            <div className='relative flex flex-col h-full'>
                <span className='text-md font-bold line-clamp-1 break-words'>{name}</span>
                <span className='text-sm break-words mt-1 line-clamp-3'>{description}</span>
                <div className='absolute flex flex-col bottom-1'>
                    <span className='text-xs text-stone-700'>Creator: {creator}</span>
                    <span className='text-xs text-stone-700'>[{len} problem(s) available]</span>
                </div>
            </div>
            <Link to={`/quizinfo/${id}`}>
                <span className='absolute w-full h-full top-0 left-0 z-0'></span>
            </Link>
        </div>
    )
}

export default QuizCard