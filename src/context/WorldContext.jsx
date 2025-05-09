import React, { createContext, useState } from "react"

export const WorldContext = createContext();

const WorldContextProvider = ({ children }) => {

     const [fogEnabled, setFogEnabled] = useState(false);
     const [starsEnabled, setStarsEnabled] = useState(false);
     const [sunEnabled, setSunEnabled] = useState(true);
     const [ambientLightEnabled, setAmbientLightEnabled] = useState(false);
     const [cameraPosition, setCameraPosition] = useState([0, 11, 75]);
     const [showMessage, setShowMessage] = useState(false);
     const [showControls, setShowControls] = useState(true);
     const [shootingStarsEnabled, setShootingStarsEnabled] = useState(false);

     return (
          <WorldContext.Provider value={{
               fogEnabled,
               setFogEnabled,
               starsEnabled,
               setStarsEnabled,
               sunEnabled,
               setSunEnabled,
               ambientLightEnabled,
               setAmbientLightEnabled,
               cameraPosition,
               setCameraPosition,
               showMessage,
               setShowMessage,
               showControls,
               setShowControls,
               shootingStarsEnabled,
               setShootingStarsEnabled
          }}>
               {children}
          </ WorldContext.Provider>
     );
};

export default WorldContextProvider;