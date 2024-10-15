import { Link } from 'react-router-dom'
import { BsArrowLeft } from 'react-icons/bs'

const BackButton = ({ destination = '/' }) => {
  return (
    <div className='flex my-4'>
        <Link to={destination} className='bg-lime-400 rounded-md'>
        <BsArrowLeft className='text-2xl text-white w-10' />
        </Link>
    </div>
  )
}

export default BackButton