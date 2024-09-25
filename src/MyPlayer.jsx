import React, { useState, useEffect, useRef } from 'react';
import VideoPlayer from './videoPlayer.jsx';

const MyPlayer = ({isLight}) => {
    const [folderName, setFolderName] = useState('');
    const [fileList, setFileList] = useState([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [showPopup, setShowPopup] = useState(true);
    const [audioTracks, setAudioTracks] = useState([]);
    const [subtitleTracks, setSubtitleTracks] = useState([]);
    const [fileJump, setFileJump] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const videoRef = useRef(null);
    const [isAutoplay, setIsAutoplay] = useState(true);
    const [isAutonext, setIsAutonext] = useState(true);

    const handleFolderSelect = async (event) => {
        const files = Array.from(event.target.files).filter(file => file.type.includes('video'));
        files.sort((a, b) => a.name.localeCompare(b.name));
        if (files.length > 0) {
            setFolderName(files[0].webkitRelativePath.split('/')[0]);
            setFileList(files);
            setCurrentFileIndex(0);
            setShowPopup(false);
        } else {
            setFolderName('');
            setFileList([]);
            setCurrentFileIndex(0);
        }
    };

    useEffect(() => {
        if (fileList.length > 0) {
            const currentFile = fileList[currentFileIndex];
            const videoURL = URL.createObjectURL(currentFile);
            videoRef.current.src = videoURL;
            videoRef.current.load();
            videoRef.current.addEventListener('loadedmetadata', updateTracks);

            return () => {
                URL.revokeObjectURL(videoURL);
                videoRef?.current?.removeEventListener('loadedmetadata', updateTracks);
            };
        }
    }, [currentFileIndex, fileList]);

    const updateTracks = () => {
        const videoPlayer = videoRef.current;
        if (videoPlayer.audioTracks) {
            const tracks = Array.from(videoPlayer.audioTracks);
            setAudioTracks(tracks);
            if (tracks.length > 2) {
                tracks[0].enabled = true;
            }
            else if (tracks.length <= 1) {
                document.getElementById('audioTrackArea').classList.add('hidden');
            }
        } else {
            document.getElementById('audioTrackArea').classList.add('hidden');
        }
        const textTracks = Array.from(videoPlayer.textTracks);
        setSubtitleTracks(textTracks);
        if (textTracks.length > 0) {
            textTracks.forEach(track => (track.mode = 'disabled'));
            textTracks[0].mode = 'showing';
        } else if (textTracks.length === 0) {
            document.getElementById('textTrackArea').classList.add('hidden');
        }
    };
    
      // Function to handle input value change
      const handleInputChange = (e) => {
        setInputValue(e.target.value);
        setErrorMessage('');  // Clear the error message when typing
      };
    
      // Function to handle form submission
      const handleSubmit = (e) => {
        e.preventDefault();
        const newIndex = parseInt(inputValue, 10) - 1; // Convert input value to zero-indexed
    
        if (newIndex >= 0 && newIndex < fileList.length) {
          setCurrentFileIndex(newIndex);
          setFileJump(false);  // Close popup on valid submission
        } else {
          setErrorMessage('Entered value is outside the range');
        }
      };

    const handleAudioTrackChange = (event) => {
        const selectedTrack = parseInt(event.target.value);
        let isVideoPlaying = null;
        audioTracks.forEach((track, index) => {
            isVideoPlaying = !videoRef.current.paused;
            isVideoPlaying ? videoRef.current.pause() : null;
            track.enabled = index === selectedTrack;
            isVideoPlaying ? videoRef.current.play() : null;
        });
    };

    const handleSubtitleTrackChange = (event) => {
        const selectedTrack = parseInt(event.target.value);
        subtitleTracks.forEach((track, index) => {
            track.mode = index === selectedTrack ? 'showing' : 'disabled';
        });
    };

    const changeVideo = (step) => {
        const newIndex = currentFileIndex + step;
        if (newIndex >= 0 && newIndex < fileList.length) {
            videoRef.current.pause();
            setCurrentFileIndex(newIndex);
            isAutoplay ? videoRef.current.play() : null;
        }
    };

    const handleFolderClick = () => {
        if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
        }
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    //add a keyboad interaction to change folder and to change the file

    useEffect(() => {
        const handleKeyDown = (e) => {
            e.stopPropagation();
            console.log(e);
            switch(e.key){
                case'q':
                    showPopup? document.getElementById("popupClose").click() : document.getElementById("folder").click();
                    break;
                case'j':
                    e.preventDefault();
                    fileList.length >= 2?
                        fileJump? setFileJump(false) : setFileJump(true)
                        :
                        setFileJump(false);
                    console.log(fileJump);
                break;
            }
          // }
        };
    
        document.addEventListener("keydown", handleKeyDown);
    
        return () => {
          document.removeEventListener("keydown", handleKeyDown);
        };
      }, [showPopup, fileJump]);

    // document.body.addEventListener("keydown",(e) => {
    //     // console.log(e);
    //     e.stopPropagation();
    //     switch(e.key){
    //         case'q':
    //         showPopup? document.getElementById("popupClose").click() : document.getElementById("folder").click();
    //         break;
    //         case'j':
    //         e.preventDefault();
    //         fileJump? setFileJump(false) : setFileJump(true);
    //         console.log(fileJump);
    //         break;
    //     }
    // });

    return (
        <>
            {showPopup && (
                <div className={`popup ${isLight ? 'light-mode' : ''}`}>
                    <div className={`popup-content ${isLight ? 'light-mode' : ''}`}>
                        <button id="popupClose" className={`popupClose ${isLight ? 'light-mode' : ''}`} onClick={handleClosePopup}>X</button>
                        <h3>Select a Folder</h3>
                        <input
                        className={`${isLight ? 'light-mode' : ''}`}
                            type="file"
                            webkitdirectory="true"
                            directory="true"
                            multiple
                            onChange={handleFolderSelect}
                        />
                        
                    </div>
                </div>
            )}
            {folderName && (
                <div style={{display:"flex",}}>
                    <h3 id="folder" className={`folder-name ${isLight ? 'light-mode' : ''}`}  onClick={handleFolderClick}>
                        {/* <span> */}
                        {folderName.substring(0, 15) +" ... "+ folderName.substring(folderName.length - 15)}
                            {/* {() => {
                                        const firstPart = folderName.substring(0, 6); // Extracts the first 6 characters  
                                        const lastPart = folderName.substring(folderName.length - 6); // Extracts the last 6 characters  

                                        const result = firstPart +" ... "+ lastPart;
                                        return (result);
                                    }
                            } */}
                        {/* </span> */}
                        {/* <br/> */}
                    </h3>
                    <h3>{">"}</h3>
                    <h3>{fileList[currentFileIndex]?.name}</h3>
                </div>
            )}
            <div className='player-area'>
                <div className={`video-container`} style={{display:"flex", justifyContent:"center"}}>
                    <VideoPlayer videoRef={videoRef} changeVideo={changeVideo} isLight={isLight}  />
                    {/* <video id="videoPlayer" ref={videoRef} className='video-player' controls></video> */}
                </div>
                {fileList.length>=2 || audioTracks.length >=2 || subtitleTracks.length >= 1 ?
                    <div className={`control ${isLight ? 'light-mode' : ''}`}>
                        <div style={{width:"-webkit-fill-available"}}>
                            <div className="controlList">
                                {currentFileIndex === 0 ? 
                                    <></> 
                                    :
                                    <button
                                            className={`nonPlayerControls ${isLight ? 'light-mode' : ''}`}
                                            onClick={() => changeVideo(-1)}
                                            // disabled={currentFileIndex === 0}
                                        >
                                            Previous
                                    </button>
                                }
                                {currentFileIndex === fileList.length - 1 ?
                                    <></>
                                    :
                                    <button
                                        className={`nonPlayerControls ${isLight ? 'light-mode' : ''}`}
                                        onClick={() => changeVideo(1)}
                                        // disabled={currentFileIndex === fileList.length - 1}
                                    >
                                        Next
                                    </button>
                                }
                                {fileList.length>=2 ?
                                    <button className={`nonPlayerControls ${isLight ? 'light-mode' : ''}`} onClick={() => {fileJump? setFileJump(false) : setFileJump(true);}}> Jump </button>
                                    :
                                    <></>
                                }
                                <div id='audioTrackArea' className="controlGroups">
                                    <label className={`${isLight ? 'light-mode' : ''}`} htmlFor="audioTrackSelect">Select Audio Track:</label>
                                    <select id="audioTrackSelect" className={`${isLight ? 'light-mode' : ''}`} onChange={handleAudioTrackChange}>
                                        {audioTracks.map((track, index) => (
                                            <option key={index} value={index}>Audio Track {index + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                <div id='textTrackArea' className="controlGroups">
                                    <label htmlFor="subtitleTrackSelect">Select Subtitle Track:</label>
                                    <select id="subtitleTrackSelect" className={`${isLight ? 'light-mode' : ''}`} onChange={handleSubtitleTrackChange}>
                                        {subtitleTracks.map((track, index) => (
                                            <option key={index} value={index}>{track.label || `Subtitle Track ${index + 1}`}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <></>
                }
                <div className={`play-list ${isLight ? 'light-mode' : ''}`}>
                    <h4>Available Videos:</h4>
                    <div className='gridFrame'>
                        <div className={`grid-container ${isLight ? 'light-mode' : ''}`}>
                            {fileList.length > 0 ? (
                            fileList.map((file, index) => (
                                <div
                                key={file.name}
                                onClick={() => setCurrentFileIndex(index)}
                                className={`grid-item ${isLight ? 'light-mode' : ''} ${index === currentFileIndex ? 'active' : ''} `}
                                title={file.name}
                                >
                                {fileList.length > 999 && index+1 <= 999 ?
                                `0${index+1}` :  
                                fileList.length > 999 && index+1 <= 99 ?
                                `00${index+1}` :
                                fileList.length > 999 && index+1 <= 9 ?
                                `000${index+1}` :
                                fileList.length > 99 && index+1 <= 99 ?
                                `0${index+1}` :
                                fileList.length > 99 && index+1 <= 9 ?
                                `00${index+1}` :
                                fileList.length > 9 && index+1 <= 9 ?
                                `0${index+1}` : `${index+1}`
                                }
                                </div>
                            ))
                            ) : (
                            <div className="no-files">No files found</div>
                            )}
                        </div>
                    </div>
                </div>
                {fileJump && (
                    <div className={`popup ${isLight ? 'light-mode' : ''}`}>
                    <div className={`popup-content ${isLight ? 'light-mode' : ''}`}>
                    <button id="JumpPopupClose" className={`popupClose ${isLight ? 'light-mode' : ''}`} style={{left: "51.5%"}} onClick={() => {setFileJump(false)}}>X</button>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{display:"flex", alignItems: "center", margin: "5px 0px"}}>
                            <h3 style={{margin:"0px",}} >Jump to: </h3>
                            {/* <label htmlFor="fileNumber">File Number: </label> */}
                            {/* <input
                                id="fileNumber"
                                type="number"
                                value={inputValue}
                                onChange={handleInputChange}
                                min="1"
                                max={fileList.length}
                                placeholder={`1 - ${fileList.length}`}
                            /> */}
                            
                            {/* Dropdown for quick selection */}
                            <select className={`${isLight ? 'light-mode' : ''}`}
                                onChange={(e) => setInputValue(e.target.value)}
                                value={inputValue}
                                style={{fontSize:"0.75em", margin:"0px 10px"}}
                            >
                                <option value="">Select a file</option>
                                {fileList.map((file, index) => (
                                <option key={index} value={index + 1}>
                                    {fileList.length > 999 && index+1 <= 999 ?
                                        `0${index+1} - ${file.name}` :  
                                        fileList.length > 999 && index+1 <= 99 ?
                                        `00${index+1} - ${file.name}` :
                                        fileList.length > 999 && index+1 <= 9 ?
                                        `000${index+1} - ${file.name}` :
                                        fileList.length > 99 && index+1 <= 99 ?
                                        `0${index+1} - ${file.name}` :
                                        fileList.length > 99 && index+1 <= 9 ?
                                        `00${index+1} - ${file.name}` :
                                        fileList.length > 9 && index+1 <= 9 ?
                                        `0${index+1} - ${file.name}` : `${index+1} - ${file.name}`
                                    }
                                   {/* {`${index + 1} - ${file.name}`} */}
                                </option>
                                ))}
                            </select>

                            {/* Error message */}
                            {errorMessage && (
                                <p className="error-message" style={{ color: 'red' }}>
                                {errorMessage}
                                </p>
                            )}
                        </div>
                        <button className={`nonPlayerControls ${isLight ? 'light-mode' : ''}`} style={{padding:"0.6"}} type="submit">Jump</button>
                        </form>
                    </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MyPlayer;
