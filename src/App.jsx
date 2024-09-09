import React, { useState, useEffect } from 'react';
import { IconContext } from "react-icons";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import MyPlayer from './MyPlayer.jsx';

function App() {
  // Dark mode is set as the default
  const [lightMode, setLightMode] = useState(false); // Dark mode by default

  // Toggle the theme
  const toggleTheme = () => {
    setLightMode(!lightMode);
  };

  // Apply the theme to the document body and save it in localStorage
  useEffect(() => {
    // document.body.classList.add("bod");
    if (lightMode) {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
    // Save the user's theme preference
    localStorage.setItem('lightMode', JSON.stringify(lightMode));
  }, [lightMode]);

  return (
    <>
      <div className={`app-container ${lightMode ? 'light-mode' : ''}`}>
        {/* Top right corner button */}
        {lightMode ? 
        <button 
        // className={`toggle-button ${lightMode ? 'light-mode' : ''}`} 
        className={`toggle-button light-mode`}
        onClick={toggleTheme}        
        >
          <IconContext.Provider value={{ className:`toggle-icon light-mode`, size: "2.5em"}}>
            <MdDarkMode />
          </IconContext.Provider>
        </button>
        : 
        <button 
        className={`toggle-button`} 
        onClick={toggleTheme}
        >
          <IconContext.Provider value={{ className:`toggle-icon`, size: "2.5em" }}>
            <MdLightMode />
          </IconContext.Provider>
        </button>
        }
        <MyPlayer isLight={lightMode}/>
      </div>
    </>
  );
}

export default App;

