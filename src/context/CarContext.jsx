import React, { createContext, useState } from "react"

export const CarContext = createContext();

const CarContextProvider = ({ children }) => {

     const [direction, setDirection] = useState(0);
     const [pause, setPause] = useState(false);
     const [textIndex, setTextIndex] = useState(0);
     const [carLights, setCarLights] = useState(false);

     return (
          <CarContext.Provider value={{
               pause,
               setPause,
               direction,
               setDirection,
               textIndex,
               setTextIndex,
               carLights,
               setCarLights
          }}>
               {children}
          </ CarContext.Provider>
     );
};

export default CarContextProvider;