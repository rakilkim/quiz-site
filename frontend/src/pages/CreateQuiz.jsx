import React, { useState, useEffect } from 'react'
import BackButton from '../components/BackButton'
import Nav from '../components/Nav'
import Spinner from '../components/Spinner'
import axios from 'axios'
import { auth, db } from '../components/Firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { RxCross1 } from "react-icons/rx";
import { FiEdit2 } from "react-icons/fi";
import { RxArrowRight } from "react-icons/rx";
import { FaRegSave } from "react-icons/fa";

const CreateQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState('');
  const [err, setErr] = useState(false);
  const [errEdit, setErrEdit] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [question, setQuestion] = useState();
  const [questionDisplay, setQuestionDisplay] = useState();
  const [answer, setAnswer] = useState('');
  const [len, setLen] = useState('');
  const [cover, setCover] = useState([]);
  const [coverDisplay, setCoverDisplay] = useState('');
  const [del, setDel] = useState(false);
  const [edit, setEdit] = useState(false);
  const [wasEditing, setWasEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState('');
  const [editedQuestion, setEditedQuestion] = useState();
  const [saveEdit, setSaveEdit] = useState(false);
  const [index, setIndex] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          setUser(docSnap.data().username);
        }
        else {
          console.log("not signed in");
          navigate('/quiz/register');
        }
      })
    }
    fetchData();
    setLoading(false);
  }, [])

  const handleQuestionFileSelect = (event) => {
    const reader = new FileReader();
    const raw = event.target.files[0];
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = function (event) {
      setQuestion([reader.result, raw]);
    }
    reader.onerror = (error) => {
      console.log(error);
    }
  }

  const handleQuestionEdit = (event) => {
    const reader = new FileReader();
    const raw = event.target.files[0];
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = function (event) {
      setEditedQuestion([reader.result, raw]);
    }
    reader.onerror = (error) => {
      console.log(error);
    }
  }

  const handleQuestionUpload = (event) => {  // is event necessary?
    if (question && answer) {
      setQuestions(questions.concat(question[1]));
      setAnswers(answers.concat(answer));
      setProblems(problems.concat({
        ques: question[0],
        ans: answer,
      }))
      setQuestion('');
      setAnswer('');
      setErr(false);
    }
    else {
      setErr(true);
    }
  }

  const handleCoverSelect = (event) => {
    const reader = new FileReader();
    const raw = event.target.files[0];
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = function (event) {
      setCover([reader.result, raw]);
    }
    reader.onerror = (error) => {
      console.log(error);
    }
  }

  const handleSaveQuiz = () => {
    const formData = new FormData();
    questions.forEach((question) => {
      formData.append("questions", question);
    })
    formData.append("answers", answers);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("len", questions.length);
    formData.append("user", user);
    formData.append("cover", cover[1]);

    setLoading(true);
    axios
      .post('http://localhost:5555', formData)
      .then(() => {
        setLoading(false);
        navigate('/');
      })
      .catch((error) => {
        setLoading(false);
        console.log(error.response.data);
        alert('something went wrong, check console');
      })
  };

  return (
    <div className=''>
      <div className='w-screen px-8 md:px-36'>
        <Nav />
      </div>
      <div className='flex justify-center'>
        <div className='flex flex-col items-center border-2 border-lime-500 rounded-xl w-4/5 max-w-3xl py-2 mb-10'>
          <span className='text-3xl font-bold text-gray-800'>Create a Quiz</span>
          <div className='flex flex-col w-full px-7'>
            <label>Name</label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full my-2 rounded-lg focus:outline-none border-2 focus:border-2 focus:border-solid focus:border-orange-900/60'
              maxLength='70'
              size='70'
            />
          </div>
          <div className='flex flex-col w-full px-7'>
            <label>Description</label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              className='w-full my-2 rounded-lg focus:outline-none border-2 focus:border-2 focus:border-solid focus:border-orange-900/60'
              maxLength='150'
              cols='73'
              rows='3'
            />
          </div>
          <div className='flex flex-col items-center w-full my-4 py-4 border-y-2 border-y-lime-600'>
            <span className='text-xl font-bold text-gray-800'>Upload Problems</span>
            <div className='flex justify-center w-full my-2'>
              <label
                htmlFor='upload-image'
                className='cursor-pointer mx-4 p-1 border-green-200 border-2 border-dashed rounded-lg hover:bg-green-200 duration-300'
              >Upload image to guess
              </label>
              <input
                id='upload-image'
                type='file'
                accept='image/*'
                onChange={handleQuestionFileSelect}
                onClick={(e) => { e.target.value = null }}
                className='opacity-0 -z-10 absolute'
              />
              <input
                type='text'
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className='min-w-0 h-10 w-96 ml-1 rounded-lg focus:outline-none border-2 focus:border-2 focus:border-solid focus:border-orange-900/60'
                placeholder='Write your answer'
                maxLength='50'
              />
              <button
                type='submit'
                onClick={(event) => handleQuestionUpload()}
                className='border-2 h-10 border-lime-500 rounded-lg mx-2 px-2 hover:bg-lime-500 duration-300'
              >Add</button>
            </div>
            {err ? (
              <span className='flex justify-center mb-1 text-lime-200'>
                Submit both the question and its answer
              </span>
            ) : (
              <></>
            )}
            {question ? (
              <img src={question[0]} className='w-20 h-20 mb-7' />
            ) : (
              <></>
            )}
            <div className='text-lg'><span className='font-bold'>{problems.length}</span> Problem(s) Uploaded</div>
            <div className='flex flex-wrap justify-center'>
              {problems.map((problem, i) => (
                <div key={i} className='relative flex flex-col items-center m-1 border-2 p-2 max-h-80 w-48'>
                  {(del && index == i) ? (
                    <div className='absolute flex flex-col items-center justify-center h-full w-full left-0 top-0 bg-gray-500/70'>
                      <span className='mb-2 text-lg'>Delete?</span>
                      <div>
                        <button
                          className='mr-4 border-2 rounded-md px-1 border-red-500'
                          onClick={() => {
                            setProblems(problems.filter((item, index) => index != i));
                            setQuestions(questions.filter((item, index) => index != i));
                            setAnswers(answers.filter((item, index) => index != i));
                            setDel(false);
                          }}
                        >Yes</button>
                        <button
                          className='border-2 rounded-md px-1'
                          onClick={() => setDel(false)}
                        >No</button>
                      </div>
                    </div>) :
                    (<></>)
                  }
                  {edit && index == i ? (
                    <div className='absolute flex flex-col items-center min-h-56 max-h-full w-full left-0 top-0'>
                      <RxArrowRight
                        className='absolute text-lg cursor-pointer right-1 top-1 bg-white/60 rounded-md'
                        onClick={() => {
                          setWasEditing(true);
                          setEdit(false);
                        }} />
                      <FaRegSave
                        className='absolute text-lg cursor-pointer right-6 top-1 bg-white/60 rounded-sm'
                        onClick={() => {
                          setSaveEdit(true);
                          setEdit(false);
                        }}
                      />
                      <label
                        htmlFor='edit-image'
                        className='cursor-pointer px-3 py-16 mt-2 border-green-300 border-2 border-dashed min-h-40 w-40 bg-gray-500/50'
                      >Upload new image
                      </label>
                      <input
                        id='edit-image'
                        type='file'
                        onChange={handleQuestionEdit}
                        className='opacity-0 -z-10 absolute'
                        accept='image/*'
                      />
                      {editedQuestion ? (
                        <img src={editedQuestion[0]} className='absolute mt-2 min-h-14 w-16 top-24' />
                      ) : (
                        <></>
                      )}
                      <textarea
                        className='my-1 h-24 w-40 z-10 border-lime-200 focus:outline-none border-2 focus:border-2 focus:border-solid focus:border-orange-900/60'
                        value={editedAnswer}
                        onChange={(e) => setEditedAnswer(e.target.value)}
                        maxLength='50'
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                  {wasEditing && index == i ? (
                    <div className='absolute flex flex-col items-center justify-center h-full w-full left-0 top-0 bg-gray-500/70'>
                      <span className='mb-2 text-lg'>Quit without saving?</span>
                      <div>
                        <button
                          className='mr-4 border-2 rounded-md px-1 border-red-500'
                          onClick={() => {
                            setEdit(false);
                            setWasEditing(false);
                            setEditedAnswer('');
                            setEditedQuestion([]);
                          }}
                        >Yes</button>
                        <button
                          className='border-2 rounded-md px-1'
                          onClick={() => {
                            setEdit(true);
                            setWasEditing(false);
                          }}
                        >No</button>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                  {saveEdit && index == i ? (
                    <div className='absolute flex flex-col items-center justify-center h-full w-full left-0 top-0 bg-gray-500/70'>
                      <span className='mb-2 text-lg'>Save Changes?</span>
                      <div>
                        <button
                          className='mr-4 border-2 rounded-md px-1 border-green-400'
                          onClick={() => {
                            if (editedAnswer) {
                              setEdit(false);
                              const copy = problems;
                              if (editedQuestion) {
                                copy[i].ques = editedQuestion[0];
                              }
                              copy[i].ans = editedAnswer;
                              setProblems(copy);
                              const qcopy = questions;
                              const acopy = answers;
                              if (editedQuestion) {
                                qcopy[i] = editedQuestion[1];
                              }
                              acopy[i] = editedAnswer;
                              setQuestions(qcopy);
                              setAnswers(acopy);
                              setEditedAnswer('');
                              setEditedQuestion('');
                            }
                            else {
                              setErrEdit(true);
                            }
                            setSaveEdit(false);
                          }}
                        >Yes</button>
                        <button
                          className='border-2 rounded-md px-1'
                          onClick={() => {
                            setEdit(true);
                            setSaveEdit(false);
                          }}
                        >No</button>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                  {errEdit && index == i ? (
                    <div className='absolute flex flex-col items-center justify-center h-full w-full left-0 top-0 bg-gray-500/70'>
                      <span className='mb-2 text-lg'>Answer is missing</span>
                      <div>
                        <button
                          className='border-2 rounded-md px-1 border-lime-500'
                          onClick={() => {
                            setEdit(true);
                            setErrEdit(false);
                          }}
                        >Go back to edit</button>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                  {!edit && !del && !wasEditing && !saveEdit && !errEdit ? (
                    <RxCross1
                      className='absolute cursor-pointer right-1 top-1 bg-gray-500/50'
                      onClick={() => {
                        setDel(!del);
                        setIndex(i);
                      }}
                    />
                  ) : (
                    <></>
                  )}
                  {!edit && !del && !wasEditing && !saveEdit && !errEdit ? (
                    <FiEdit2
                      className='absolute cursor-pointer right-6 top-1 bg-gray-500/50'
                      onClick={() => {
                        setEdit(true);
                        setIndex(i);
                        setEditedAnswer(problem.ans)
                      }}
                    />
                  ) : (
                    <></>
                  )}

                  <img src={problem.ques} className='h-40 w-40' />
                  <span className='break-words w-40 italic text-lime-300'>{problem.ans}</span>
                </div>
              ))}
            </div>
          </div>
          <label
            htmlFor='cover'
            className='cursor-pointer mb-3 mx-2 p-1 border-green-200 border-2 border-dashed rounded-lg hover:bg-green-200 duration-300'>
            Upload Cover Image
          </label>
          <input
            id='cover'
            type='file'
            onChange={handleCoverSelect}
            className='opacity-0 -z-10 absolute'
            size='70'
          />
          <img src={cover[0]} className='w-96' />
          <button
            type='submit'
            onClick={() => handleSaveQuiz()}
            className='border-2 border-lime-500 rounded-lg m-2 px-2 py-1 hover:bg-lime-500 duration-300'
          >Submit</button>
        </div>
      </div>
    </div>
  )
}

export default CreateQuiz