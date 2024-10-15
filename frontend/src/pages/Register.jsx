import React, { useState } from 'react';
import { Link, useNavigate }  from 'react-router-dom';
import { auth, db } from '../components/Firebase';
import { setDoc, doc, query, getDocs, collection, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Nav from '../components/Nav';
import { FaCheck } from "react-icons/fa6";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';



const register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPW, setShowPW] = useState(false);
  const navigate = useNavigate();

  const showPassword = () => {
    if (showPW) {
      return 'text';
    }
    return 'password';
  }

  const isUsernameUnique = async (db, username) => {
    const q = query(collection(db, "Users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;  // true if no matching username is found
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const isUnique = await isUsernameUnique(db, username);
      if (!isUnique) {
        toast.error("Username taken, please pick another.", {
          position: "top-center"
        });
        return
      }
      if (username.length < 3) {
        toast.error("Username must be at least 3 characters.", {
          position: "top-center"
        });
        return
      }
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          username: username,
          message: "Hello",
        });
      }
      setEmail("");
      setUsername("");
      setPassword("");
      toast.success("success", {
        position: "top-center"
      });
      navigate('/');
    } 
    catch(error) {
      console.log(error);
      toast.error(error.message, {
        position: "bottom-center"
      });
    }
  }

  return (
    <div className='flex flex-col items-center select-none'>
      <ToastContainer/>
      <div className='w-full px-12 md:px-36'>
        <Nav />
      </div>
      <div className='flex flex-col items-center border-2 border-lime-500 rounded-xl
                      w-96 h-auto'>
        <span className='font-bold text-gray-800 mt-5 text-2xl'>Create an Account</span>
        <span className='mb-4 mt-1 text-sm'>By doing so, you can create your own quizzes
        </span>
        <form
          onSubmit={handleRegister}
          className='w-11/12'
        >
          <div className='flex flex-col mx-2 mt-4'>
            <label>Username</label>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full h-8 my-2 rounded-sm bg-gray-200 focus:outline-none focus:border-2 focus:border-solid focus:border-lime-500'
              maxLength='320'
              size='40'
              placeholder='minimum 3 characters'
              required
            />
          </div>
          <div className='flex flex-col mx-2'>
            <label>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full h-8 my-2 rounded-sm bg-gray-200 focus:outline-none focus:border-2 focus:border-solid focus:border-lime-500'
              maxLength='320'
              size='40'
              required
            />
          </div>
          <div className='flex flex-col mx-2 mb-2'>
            <label>Password</label>
            <input
              type={showPW ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full h-8 my-2 rounded-sm bg-gray-200 focus:outline-none focus:border-2 focus:border-solid focus:border-lime-500'
              maxLength='320'
              size='40'
              placeholder='minimum 6 characters'
              required
            />
            <div className='flex items-center'>
              <div className='cursor-pointer w-4 h-4 border-2 rounded-sm mx-2'
                onClick={() => setShowPW(!showPW)}
              >
                {showPW ? (
                  <FaCheck className='w-3 h-3' />
                ) : (
                  <></>
                )}
              </div>
              <span>Show Password</span>
            </div>
          </div>
          <div className='flex justify-center mt-10'>
            <button className='border-2 text-lg border-lime-200 hover:bg-lime-500 duration-300 rounded-2xl w-full py-1'>
              Create Account
            </button>
          </div>
          <div className='flex justify-center mt-2 mb-7 text-md'>
            <span>or <Link className='font-bold cursor-pointer hover:text-lime-500 duration-200' to={'/quiz/login'}> log in</Link></span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default register