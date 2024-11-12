import React, { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import Spinner from '../components/Spinner'
import { useParams } from 'react-router-dom'

const Score = () => {
  const { id, score, len, scores } = useParams();
  const [scoreList, setScoreList] = useState([]);
  const [max, setMax] = useState(-1);
  const [newList, setNewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heights, setHeights] = useState([]);
  const [percent, setPercent] = useState(0);
  let rank = 0;
  let total = 0;
  let newL = [];
  let h = Array(len + 1).fill(0);

  useEffect(() => {
    setScoreList(scores.split(','));
    //setScoreList(Array(130).fill(0));
  }, [scores])
  useEffect(() => {
    setLoading(true);
    const l = scoreList.length;
    const heightsList = ['h-4','h-8','h-12','h-16','h-20','h-24',
      'h-28','h-32','h-36','h-40','h-44','h-48','h-52','h-56'];  // dynamic class names
    if (scoreList.length > 70) {
      for (let i = 0; i < l; i += 2) {
        newL.push(scoreList[i] + scoreList[i + 1]);
      }
      const max = (Math.max(...newL));
      const len = newList.length;
      for (let i = 0; i < len; i++) {
        if (newL[i] != 0) {
          let height = Math.floor(((newL[i] * (56 / max)) / 4)) * 4;
          for (let j = 0; j < heightsList.length; j++) {
            if (parseInt(heightsList[j].slice(2)) == height) {
              height = heightsList[j];
              break;
            }
          }
          if (i == score) {
            h[i] = `${height} bg-teal-200`;

          }
          else {
            h[i] = `${height} bg-green-500`;
          }
        }
        else {
          h[i] = `h-1 bg-green-500`;
        }
        if (i >= score) {
          rank = rank + newL[i];
        }
        total = total + newL[i];
      }
      setNewList(newL);
    }
    else {
      const max = Math.max(...scoreList);
      for (let i = 0; i < l; i++) {
        if (scoreList[i] != 0) {
          let height = Math.floor(((scoreList[i] * (56 / max)) / 4)) * 4;
          for (let j = 0; j < heightsList.length; j++) {
            if (parseInt(heightsList[j].slice(2)) == height) {
              height = heightsList[j];
              break;
            }
          }
          if (i == score) {
            h[i] = `${height} bg-teal-200`;
          }
          else {
            h[i] = `${height} bg-green-500`;
          }
        }
        else {
          h[i] = `h-1 bg-green-500`;
        }
        if (i >= score) {
          rank = rank + parseInt(scoreList[i]);
        }
        total = total + parseInt(scoreList[i]);
      }
      setHeights(h);
    }
    if (total) {
      setPercent(Math.floor((rank / total) * 100));
    }
    else {
      setPercent(100);
    }
  }, [scoreList]);

  useEffect(() => {
    if (heights.length == scores.split(',').length) {
      setLoading(false);
    }
  }, [heights])


  return (
    <>
      {loading ? (
        <div className='flex justify-center mt-10'>
          <Spinner />
        </div>
      ) : (
        <div className='flex flex-col items-center'>
          <div className='w-screen px-12 md:px-36'>
            <Nav />
          </div>
          <div
            className='text-2xl font-bold'
          >You got
            <span className='text-lime-300'> {score} </span>
            out of {len} right!
          </div>
          <div className='mt-10 text-lime-300 text-2xl font-bold'>Overall Score Distribution</div>
          {newList.length == 0 ? (
            <div className='flex justify-center my-3 min-w-64 max-w-4/5 lg:max-w-3/5 h-64'>
              {scoreList.map((bar, id) => (
                <div key={id} className='flex flex-col w-full items-center'>
                  <div
                    className={`${heights[id]} text-center rounded-t-md w-4/5 mx-1 mt-auto`}>
                  </div>
                  {scoreList.length < 32 ? (
                    <div className='text-lime-300 hidden sm:flex'>{id}</div>
                  ) : (
                    <></>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='flex justify-center my-3 w-4/5 lg:w-3/5 h-64'>
              {newList.map((bar, id) => (
                <div key={id} className='flex flex-col w-full items-center'>
                  <div
                    className={`${heights[id]} text-center rounded-t-md w-4/5 mx-1 mt-auto`}>
                  </div>
                  {newList.length < 32 ? (
                    <div className='text-lime-300 hidden sm:flex'>{id}</div>
                  ) : (
                    <></>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className='text-teal-100'>
            You are better than <span className='text-lime-400'>{100 - percent}%</span> of the people
          </div>
        </div>
      )}
    </>
  )
}

export default Score