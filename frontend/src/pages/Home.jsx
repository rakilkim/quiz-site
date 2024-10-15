import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Spinner from '../components/Spinner'
import Nav from '../components/Nav'
import QuizCard from '../components/QuizCard'
import { auth, db } from '../components/Firebase'
import { Link } from 'react-router-dom'
import { MdOutlineAddBox } from 'react-icons/md'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'



const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [uid, setUid] = useState('');

  useEffect(() => {
    setLoading(true);
    axios
      .get('https://guessquiz-9c9067408cb5.herokuapp.com/quiz')
      .then((response) => {
        setQuizzes(response.data);
        console.log(response.data)
      })
      .catch((error) => {
        console.log(error);
      });
    const fetchData = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          setUserInfo(docSnap.data());
          setUid(user.uid);
          setLoading(false);
        }
        else {
          console.log("not signed in");
          setLoading(false);
        }
      })
    }
    fetchData();
  }, []);

  return (
    <div className='px-4 flex flex-col items-center'>
      {loading ? (
        <div className='flex justify-center mt-10'>
          <Spinner />
        </div>
      ) : (
        <div className='flex flex-col w-full'>
          <div className='flex px-8 md:px-32 justify-between items-center'>
            <Nav />
            {userInfo ? (
              <div className='flex items-center'>
                <Link to='/quiz/create'>
                  <MdOutlineAddBox className='text-green-400 hover:scale-105 text-4xl' />
                </Link>
                <Link className='border-2 md:mx-10 border-green-400 px-2 py-1 text-white rounded-md
                              mx-5 hover:bg-teal-700 duration-300'to={`profile/${uid}`}>
                  Profile
                </Link>
              </div>
            ) : (
              <div className='flex items-center'>
                <Link to='/quiz/create'>
                  <MdOutlineAddBox className='text-green-400 hover:scale-105 text-4xl' />
                </Link>
                <Link to='/quiz/login'>
                  <div className='border-2 md:mx-10 border-green-400 px-2 py-1 text-white rounded-md
                                mx-5 hover:bg-teal-700 duration-300'>Log In</div>
                </Link>
              </div>
            )}

          </div>
          <div className='flex justify-center'>
            <div className='flex justify-center flex-wrap max-w-6xl'>
              {quizzes.map((quiz) => (
                <QuizCard key={quiz._id} id={quiz._id} name={quiz.name} description={quiz.description} creator={quiz.createdBy} len={quiz.len} image={quiz.coverUrl} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home