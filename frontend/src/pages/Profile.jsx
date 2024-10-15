import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { auth, db } from '../components/Firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { FiEdit2 } from "react-icons/fi";
import { FaRegSave } from "react-icons/fa";
import { RxArrowRight } from "react-icons/rx";
import Nav from '../components/Nav'
import Spinner from '../components/Spinner'
import axios from 'axios'
import QuizCard from '../components/QuizCard'

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [joinedDate, setJoinedDate] = useState("");
  const [changes, setChanges] = useState("");
  const [quitEditing, setQuitEditing] = useState(false);
  const [msg, setMsg] = useState("");
  const [originalMsg, setOriginalMsg] = useState("");
  const [yourQuizzes, setYourQuizzes] = useState([]);
  const [editing, setEditing] = useState(false);
  const [logout, setLogout] = useState(false);
  const { uid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const docRef = doc(db, "Users", uid);
      const docSnap = await getDoc(docRef);
      setUsername(docSnap.data().username);
      setEmail(docSnap.data().email);
      setMsg(docSnap.data().message);
      setLoading(false);
    }
    fetchData();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const creationTime = user.metadata.creationTime;
        const date = new Date(creationTime);
        setJoinedDate(date.toLocaleDateString()); // Format the date as needed
      } else {
        // User is signed out
        setJoinedDate('');
        navigate('/login'); // Redirect to login if needed
      }
    })
    setLoading(true);
    if (username) {
      axios
        .get(`https://guessquiz-9c9067408cb5.herokuapp.com/quiz/user/${username}`)
        .then((response) => {
          setYourQuizzes(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        })
    }
    return () => {
      unsubscribe();  // onAuthStateChanged returns a function, which "unsubscribes" the listener, to avoid unnecessary memory usage
    }
  }, [username])

  const signout = () => {
    signOut(auth)
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        console.log(error);
      })
  }
  const startEditing = () => {
    setEditing(true);
    setOriginalMsg(msg);
    setChanges(msg);
  }
  const saveChanges = async () => {
    try {
      setEditing(false)
      setMsg(changes);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          username: username,
          message: changes,
        });
      }
      setChanges("");
    } catch (error) {
      console.log(error);
    }
  }
  const quit = () => {
    setEditing(false);
    setQuitEditing(false);
    setMsg(originalMsg);
    setChanges("");
  }

  return (
    <div className='px-4 flex flex-col items-center'>
      <div className='w-full px-8 md:px-32'>
        <Nav />
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className='flex flex-col items-center'>
          <div className='border-2 border-lime-500 rounded-md py-5 pl-5 w-96'>
            <div className='text-xl font-bold mb-2'>Username: {username}</div>
            <div className=''>Email: {email}</div>
            <div className=''>Joined on {joinedDate}</div>
            <div
              className='relative border-2 border-lime-200 rounded-sm mt-1 mr-5 p-1 h-auto break-words'>
              <div className='mr-4'>
                {msg}
              </div>
              {editing ? (
                <div className='h-full w-full'>
                  <textarea
                    value={changes}
                    onChange={(e) => setChanges(e.target.value)}
                    className='absolute resize-none left-0 top-0 w-full h-full'
                    maxLength='150'
                  ></textarea>
                  <FaRegSave className='absolute right-5 -top-5 cursor-pointer hover:scale-90' onClick={saveChanges} />
                  <RxArrowRight className='absolute right-0 -top-5 cursor-pointer hover:scale-90' onClick={() => setQuitEditing(true)} />
                </div>
              ) : (
                <FiEdit2 className='absolute right-0 top-0 cursor-pointer hover:scale-90' onClick={startEditing} />
              )}
            </div>
            {quitEditing ? (
              <div>
                <div className='font-bold my-1'>Quit without saving?</div>
                <button className='mr-1 border-2 px-1 rounded-sm border-red-500' onClick={quit}>yes</button>
                <button className='border-2 px-1 rounded-sm border-lime-200' onClick={() => setQuitEditing(false)}>no</button>
              </div>
            ) : (
              <></>
            )}
            <button
              className='mt-5 border-2 px-2 py-1 text-sm rounded-md border-red-500 hover:border-white duration-500'
              onClick={() => setLogout(true)}
            >
              Sign Out</button>
            {logout ? (
              <div className='flex-col'>
                <div className='font-bold my-1'>Sign out?</div>
                <button className='mr-1 border-2 px-1 rounded-sm border-red-500' onClick={signout}>yes</button>
                <button className='border-2 px-1 rounded-sm border-lime-200' onClick={() => setLogout(false)}>no</button>
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className='mt-5 text-xl'>Your Quizzes</div>
          <div className='flex justify-center flex-wrap max-w-6xl'>
            {yourQuizzes.map((quiz) => (
              <QuizCard key={quiz._id} id={quiz._id} name={quiz.name} description={quiz.description} creator={quiz.createdBy} len={quiz.len} image={quiz.coverUrl} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default Profile