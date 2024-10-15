import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import Nav from '../components/Nav'
import { BsThreeDots } from "react-icons/bs"
import { AiOutlineEdit } from 'react-icons/ai'
import { MdOutlineDelete } from 'react-icons/md'
import { auth, db } from '../components/Firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const QuizInfo = () => {
  const [quiz, setQuiz] = useState({});
  const [lengths, setLengths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [del, setDel] = useState(false);
  const [userInfo, setUserInfo] = useState();
  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    setLoading(true);
    axios
      .get(`https://guessquiz-9c9067408cb5.herokuapp.com/quiz/${id}`)
      .then((response) => {
        setQuiz(response.data);
        const len = response.data.len;
        let arr = [];
        if (len > 10) {
          for (let i = 10; i < len; i += 10) {
            arr.push(i);
          }
          if (len % 10) {
            arr.push(len);
          }
        }
        else {
          arr.push(len);
        }
        setLengths(arr);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      })
      const fetchData = async () => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const docRef = doc(db, "Users", user.uid);
            const docSnap = await getDoc(docRef);
            setUserInfo(docSnap.data());
            setLoading(false);
          }
          else {
            console.log("not signed in");
            setLoading(false);
          }
        })
      }
      fetchData();
  }, [])

  const handleDelete = () => {
    setLoading(true);
    axios
      .delete(`https://guessquiz-9c9067408cb5.herokuapp.com/quiz/${id}`)
      .then(() => {
        setLoading(false);
        navigate('/');
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      })
  }

  return (
    <div className='px-4 flex flex-col items-center'>
      <div className='flex justify-between items-center w-full px-4 md:px-32'>
        <Nav />
        {loading ? (
          <></>
        ) : (
          <div className='group relative'>
            {userInfo && quiz && quiz.createdBy == userInfo.username ? (
              <div>
                <BsThreeDots
              className='cursor-pointer text-white text-3xl'
            />
            <div className='absolute ml-auto mr-auto w-full h-full group-hover:w-auto group-hover:h-auto left-0 
            top-0 group-hover:top-7 group-hover:-left-5 group-hover:-right-5 flex justify-between'>
              <MdOutlineDelete
                className='cursor-pointer opacity-0 group-hover:opacity-100 duration-300 group-hover:text-3xl text-red-600 transition hover:-translate-y-1'
                onClick={() => setDel(true)}
              />
              <Link to={`/quiz/edit/${id}`}>
                <AiOutlineEdit className='cursor-pointer opacity-0 group-hover:opacity-100 
                duration-300 group-hover:text-3xl text-lime-400 transition hover:-translate-y-1'/>
              </Link>
            </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
      {loading ? (
        <div className='flex justify-center'>
          <Spinner />
        </div>
      ) : (
        <div className='flex flex-col items-center w-full'>
          <img src={quiz.coverUrl} alt='quiz' className='h-64 w-auto m-5 rounded-md' />
          <div className='flex flex-col items-center border-2 border-lime-500 rounded-xl w-4/5 max-w-2xl p-4'>
            <div className='my-1 w-full text-center'>
              <span className=' text-slate-200 text-2xl font-bold break-words'>{quiz.name}</span>
            </div>
            <div className='w-full my-1 text-center'>
              <span className='text-slate-300 break-words'>{quiz.description}</span>
            </div>
            <div className='mt-1'>
              <span className=' text-gray-800'>Created By "{quiz.createdBy}"</span>
            </div>
            <span className='text-sm text-gray-800'>Created: {new Date(quiz.createdAt).toString().substring(0, 16)}</span>
            <span className='text-xs text-gray-800'>total {quiz.len} questions available</span>
          </div>
          <div className='flex'>
            {lengths.map((length, i) => (
              <div key={i} className='my-4'>
                {length % 10 == 0 ? (
                  <Link
                    to={`/quiz/${id}/${length}`}
                    className='border-2 my-4 mx-1 text-white rounded-md p-1 border-green-500 shadow-md
                     hover:bg-green-600 hover:shadow-none duration-300'
                  >
                    Solve {length} questions
                  </Link>
                ) : (
                  <Link
                    to={`/quiz/${id}/${length}`}
                    className='border-2 my-4 mx-1 text-white rounded-md p-1 border-green-500 shadow-md
                     hover:bg-green-600 hover:shadow-none duration-300'
                  >
                    Solve all {length} question(s)
                  </Link>
                )}
              </div>
            ))}

          </div>
        </div>
      )}
      {del ? (
        <div className='absolute
          ml-auto mr-auto left-0 right-0
          mt-auto mb-auto top-0 bottom-0
          flex flex-col items-center justify-center '>
          <div className='flex flex-col justify-center items-center w-3/5 h-2/5 max-w-xl border-2 rounded-lg border-lime-200 bg-emerald-400/70'>
            <span className='text-xl'>Are you sure you want to delete this quiz?</span>
            <div className='mt-5'>
              <button
                className='mr-3 hover:bg-red-500 duration-300 border-2 rounded-md px-2 border-red-500'
                onClick={handleDelete}
              >Yes</button>
              <button
                className='ml-3 hover:bg-white duration-300 border-2 rounded-md px-2 border-white'
                onClick={() => setDel(false)}
              >No</button>
            </div>
          </div>

        </div>
      ) : (
        <></>
      )}
    </div>
  )
}

export default QuizInfo