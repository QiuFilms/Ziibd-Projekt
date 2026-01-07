import './App.css';

import "./index.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import { createContext, useEffect, useState } from "react";
import bg from "./images/background.svg"
import { SiHelpscout } from "react-icons/si";

// import Spinner from 'react-bootstrap/Spinner';
import Main from "./components/Main";
import Auth from "./components/Auth";
import { Spinner } from 'react-bootstrap';
import { API } from './util';

export const User = createContext(null)


function App(){
  const [user, setUser] = new useState(null)
  const [isConnected, setIsConnected] = new useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
            // await window.api.connect("155.158.112.45", "oltpstud", "ziibd10", "haslo2025") 
            console.log(new URL("connection", API));
            
            const result = await fetch(new URL("connection", API))

            if(result.ok){
              setIsConnected(true) 
            }
      } catch (error) {
            console.error("Failed to fetch table info:", error);
      }
    };

    fetchData();
  },[])


  useEffect(() => {
    console.log(user);
    
  },[user])

  return(
    <>
      {
        isConnected ? 
            <User.Provider value={[user, setUser]}>
              { !user ? 
                // <Login/>
                <Auth/>
                :
                <Main/>
              }
            </User.Provider>
            :
            <>

              <div className='background'>
                  <img src={bg} alt="" />
              </div>

              <div className="logo">
                  <SiHelpscout className='logoIcon'/>
                  <div className="name">
                      HD Equilibrium
                  </div>
              </div>

              <div className="outerSpinner">
                <Spinner animation="border" variant="dark"/>
                <p>Connecting</p>
              </div>
            </>

      }
    </>
    
  )
}

export default App;
