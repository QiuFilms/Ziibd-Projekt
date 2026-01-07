import PanelButton from "./PanelButton";
import { FaHome, FaTachometerAlt  } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { ImProfile } from "react-icons/im";
import { TiDocumentText } from "react-icons/ti";
import { SiHelpscout } from "react-icons/si";
import { FaUserAstronaut } from "react-icons/fa";
import { User } from "../App";
import { useContext } from "react";
import Issues from "./Issues";

export default function Main(){
    const [user, setUser] = new useContext(User)

    return(
        <>
            <div className="header">
                <div className="left">
                    <SiHelpscout className="logoIcon"/>
                    HD Equilibrium
                </div>
                <div className="right">

                </div>
            </div>

            <div className="main">
                <div className="panel">
                    <PanelButton>
                        <TiDocumentText className="ButtonIcon"/> Issues
                    </PanelButton>

                    {/* <PanelButton>
                        <CgProfile  className="ButtonIcon"/> Profile
                    </PanelButton>

                    <PanelButton>
                        <FaTachometerAlt className="ButtonIcon"/> Statistics
                    </PanelButton> */}

                    <div className="user PanelButton">
                        {
                            user.picture ? 
                            <FaUserAstronaut/>
                            :
                            <FaUserAstronaut className="userIcon"/>
                
                        }
                        {user.USERNAME}
                    </div>
                    <div className="logout PanelButton" onClick={() => setUser(null)}>
                        Logout
                    </div>
                </div>

                    <div className="content">
                        <Issues/>
                        {/* <Issue/> */}

                    </div>
            </div>
        </>
    )
}