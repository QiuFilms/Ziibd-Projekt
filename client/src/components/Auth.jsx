import { useState } from "react"
import Login from "./Login"
import Register from "./Register"
import bg from "../images/background.svg"

export default function Auth(){
    const [isRegister, setIsRegister] = useState(false)


    return(
        <>
            <div className='background'>
                <img src={bg} alt="" />
            </div>

            {
                isRegister ? 
                <Register setIsRegister = {setIsRegister}/>
                :
                <Login setIsRegister = {setIsRegister}/>
            }
        </>

    )
}