'use client'
import React, { useState, useEffect } from 'react';

interface CrosswordProps {
  jsonFile: string;
  flag: boolean;
}

interface Step {
  total_step: number;
  env_step: number;
  actions: string[];
  info: {
    r_letter: number;
    r_word: number;
  };
  count: {
    sure: number;
    maybe: number;
    impossible: number;
  };
}

const processActionsToMatrix = (actions: string[]): string[] => {
    const matrix: string[] = Array(25).fill('');
  
    actions.forEach((action) => {
      const matchResult = action.match(/(h|v)(\d+)\.\s(.+)/);
  
      if (matchResult !== null) {
        const [, direction, index, word] = matchResult;
  
        // Convert index to 0-based and split the word into characters
        const parsedIndex = parseInt(index || '', 10);
  
        // Check if parsedIndex is a valid number
        if (!isNaN(parsedIndex) && parsedIndex >= 1 && parsedIndex <= 5) {
          const startIndex = parsedIndex - 1;
          const chars = word?.split('') || [];
  
          // Calculate the start position in the matrix
          const matrixStartIndex = direction === 'h' ? startIndex * 5 : startIndex;
  
          // Update the matrix based on the direction
          for (let i = 0; i < chars.length; i++) {
            if (matrix[matrixStartIndex + (direction === 'h' ? i : i * 5)] !== undefined) {
              matrix[matrixStartIndex + (direction === 'h' ? i : i * 5)] = chars[i]?.toUpperCase() || '';
            }
          }
        }
      }
    });
  
    return matrix;
  };

const Crossword: React.FC<CrosswordProps> = ({ jsonFile, flag }) => {
  const [crosswordData, setCrosswordData] = useState<{
    clues: string[];
    grid: string[];
    steps: Step[];
  }>({
    clues: [],
    grid: [],
    steps: [],
  });
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the crossword data from the JSON file
    fetch(jsonFile)
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data);
        setCrosswordData({
          clues: data[0],
          grid: data[1],
          steps: data[2] as Step[],
        });
      })
      .catch((error) => {
        setError('Error fetching crossword data');
        console.error('Error fetching crossword data:', error);
      })
      .finally(() => setLoading(false));
  }, [jsonFile]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, crosswordData.steps.length - 1));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  //incomplete/step-by-step crossword
  if (flag) {
    const currentStep = crosswordData.steps[currentPage];

    return (
      <>
      
        <div className="crossword-grid ">
        {crosswordData.clues.length > 0 &&
            crosswordData.grid.length > 0 &&
            crosswordData.clues.map((clue, index) => (
            <div key={index} className="word-row">
                {currentStep?.actions && processActionsToMatrix(currentStep.actions)
                .slice(index * 5, (index + 1) * 5)
                .map((letter, i) => (
                    <input key={i} type="text" maxLength={1} value={letter} readOnly />
                ))}
            </div>
            ))}
        </div>

        <div className="pagination">
          <button onClick={handlePrevPage} disabled={currentPage === 0}>
            Prev
          </button>
          <span>
            {currentPage + 1} / {crosswordData.steps.length}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === crosswordData.steps.length - 1}>
            Next
          </button>
        </div>

        <div className='grid grid-cols-3 gap-4 mt-8 mx-auto'>
            <div className="clues col-span-1">
            {currentStep?.actions?.map((action, index) => (
                <p key={index} className={index === currentPage ? 'active' : ''}>
                {action}
                </p>
            ))}
            </div>

            <div className="info col-span-1">
                {currentStep?.info && (
                <div>
                    <h3>Info:</h3>
                    <p>r_letter: {currentStep.info.r_letter}</p>
                    <p>r_word: {currentStep.info.r_word}</p>
                </div>
                )}
            </div>
            <div className='votes col-span-1'>
                {currentStep?.count && (
                <div>
                    <h3>Votes:</h3>
                    <p>Sure: {currentStep.count.sure}</p>
                    <p>Maybe: {currentStep.count.maybe}</p>
                    <p>Impossible: {currentStep.count.impossible}</p>
                </div>
                )}
            </div>
        </div>

      </>
    );
  }

  // Completed crossword rendering
  return (
    <>
      <div className="crossword-grid">
        {crosswordData.clues.length > 0 &&
          crosswordData.grid.length > 0 &&
          crosswordData.clues.map((clue, index) => (
            <div key={index} className="word-row">
              {crosswordData.grid.slice(index * 5, (index + 1) * 5).map((letter, i) => (
                <input key={i} type="text" maxLength={1} value={letter} readOnly />
              ))}
            </div>
          ))}
      </div>

      <div className="clues mx-auto mt-4">
        {crosswordData.clues.map((clue, index) => (
          <p key={index}>{clue}</p>
        ))}
      </div>
    </>
  );
};

export default Crossword;

// 'use client'
// import { useState, useEffect } from 'react';

// const Crossword = ({jsonFile, flag }: { jsonFile: string; flag: boolean }) => {
//   const [crosswordData, setCrosswordData] = useState<[string[], string[]]>([[], []]);
//   const [currentPage, setCurrentPage] = useState<number>(0);
//   const [stepsData, setStepsData] = useState<{ 
//     actions?: string[]; 
//     info?: { r_letter: number; r_word: number }; 
//     count?: { sure: number; maybe: number; impossible: number } }[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     // Fetch the crossword data from the JSON file
//     fetch(jsonFile)
//       .then((response) => response.json())
//       .then((data) => {
//         console.log('Fetched data:', data);
//         // const hardcodedData: [string[], string[]] = [["clue1", "clue2"], ["A", "B"]];
//         // setCrosswordData(hardcodedData)
//         // setLoading(false)

//         // if (Array.isArray(data) && typeof data[0] === 'string') {
//         //   setCrosswordData(data as [string[], string[]]);
//         // } else if (Array.isArray(data) && typeof data[0] === 'object' && 'actions' in data[0]) {
//         //   setStepsData(data as { 
//         //     actions?: string[]; 
//         //     info?: { r_letter: number; r_word: number }; 
//         //     count?: { sure: number; maybe: number; impossible: number } 
//         //   }[]);
//         // }
//       })
//       .catch((error) => {
//         setError('Error fetching crossword data');
//         console.error('Error fetching crossword data:', error);
//       })
//       .finally(() => setLoading(false));
//       console.log("skdfas")
//   }, [jsonFile]);


//   const handleNextPage = () => {
//     setCurrentPage((prevPage) => Math.min(prevPage + 1, crosswordData.length - 1));
//   };

//   const handlePrevPage = () => {
//     setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
//   };

//   if (loading) {
//     return <p>Loading...</p>; 
//   }

//   if (error) {
//     return <p>{error}</p>; 
//   }

//   if (flag) {
//     return (
//       <>
//         <div className="crossword-grid">
//           <div className="word-row">
//             {stepsData[currentPage]?.actions?.map((action, index) => (
//               <input key={index} type="text" maxLength={1} value={action} readOnly />
//             ))}
//           </div>
//         </div>

//         <div className="clues">
//           {stepsData.map((step, index) => (
//             <p key={index} className={index === currentPage ? 'active' : ''}>
//               {step.actions?.join(', ')}
//             </p>
//           ))}
//         </div>

//         {/* <div className="pagination">
//           <button onClick={handlePrevPage} disabled={currentPage === 0}>
//             Prev
//           </button>
//           <span>{currentPage + 1} / {stepsData.length}</span>
//           <button onClick={handleNextPage} disabled={currentPage === stepsData.length - 1}>
//             Next
//           </button>
//         </div> */}
//       </>
//     );
//   }

//   // Completed crossword rendering
//   return (
//     <>
//       <div className="crossword-grid">
//         {/* Render your crossword grid here using crosswordData */}
//         {crosswordData[0].map((clue, index) => (
//           <div key={index} className="word-row">
//             {/* Render input field for each letter in the word */}
//             {crosswordData[1].slice(index * 5, (index + 1) * 5).map((letter, i) => (
//               <input key={i} type="text" maxLength={1} value={letter} readOnly />
//             ))}
//           </div>
//         ))}
//       </div>

//       {/* Display clues separately below the crossword grid */}
//       <div className="clues">
//         {crosswordData[0].map((clue, index) => (
//           <p key={index}>{clue}</p>
//         ))}
//       </div>
//     </>
//   );
// };

// export default Crossword