import React, { useState } from 'react';
import { Link, useNavigate }  from 'react-router-dom';
import { auth, db } from '../components/Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Nav from '../components/Nav';
import { FaCheck } from "react-icons/fa6";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';



const login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPW, setShowPW] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("success", {
        position: "top-center"
      });
      navigate('/')
    }
    catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center"
      });
    }
    setPassword("");
  }

  return (
    <div className='flex flex-col items-center select-none'>
      <ToastContainer />
      <div className='w-full px-12 md:px-36'>
        <Nav />
      </div>
      <div className='flex flex-col items-center border-2 border-lime-500 rounded-xl
                      w-96 h-auto'>
        <span className='font-bold text-gray-800 mt-5 text-2xl'>Log In</span>
        <form
          onSubmit={handleLogin}
          className='w-11/12'
        >
          <div className='flex flex-col mx-2 mt-4'>
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
          <div className='flex justify-center mt-10 '>
            <button className='border-2 text-lg border-lime-200 hover:bg-lime-500 duration-300 rounded-2xl w-full py-1'>
              Submit
            </button>
          </div>
          <div className='flex justify-center mt-3 mb-7 text-md'>
            <span>or 
              <Link className='font-bold cursor-pointer hover:text-lime-500 duration-200' 
              to={'/quiz/register'}> create account</Link></span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default login