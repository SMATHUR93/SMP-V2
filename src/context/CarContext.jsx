import React, { createContext, useState } from "react"

export const CarContext = createContext();

const CarContextProvider = ({ children }) => {

     const [direction, setDirection] = useState(0);
     const [pause, setPause] = useState(false);
     const [textIndex, setTextIndex] = useState(0);

     return (
          <CarContext.Provider value={{
               pause,
               setPause,
               direction,
               setDirection,
               textIndex,
               setTextIndex
          }}>
               {children}
          </ CarContext.Provider>
     );
};

export default CarContextProvider;