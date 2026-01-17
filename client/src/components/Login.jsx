import { useContext, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { SiHelpscout } from "react-icons/si";
import { User } from "../App";
import Alert from 'react-bootstrap/Alert';
import bcrypt from "bcryptjs";
import { API } from '../util';

export default function Login({setIsRegister}){
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState(null);

    const [user, setUser] = new useContext(User)

    const state = useRef({
        username:"",
        password:"",
    })

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const form = event.currentTarget;
        if(form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }else{
            const fetchData = async () => {
                try {
                    // const salt = await bcrypt.genSalt(10);
                    // const hashedPassword = await bcrypt.hash(state.current.password, salt);

                    const response = await fetch(new URL("login", API), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    username: state.current.username,
                                    password: state.current.password
                                })
                            });
                        
                    const json = await response.json()
                    if(response.ok){
                        setUser(json.data)
                    }else{
                        setError("Invalid credentials")
                    }

                } catch (error) {
                    setValidated(false);
                    setError("Something went wrong...")
                    return
                }
            };

            fetchData();

        }

        setValidated(true);
    };

    return(
        <>
            <div className="logo logoLogin">
                <SiHelpscout className='logoIcon'/>
                <div className="name">
                    HD Equilibrium
                </div>
            </div>

            <div className='login'>
                <h2>Login</h2>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Group className="mt-4 formElem" controlId="userName">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter username"
                            aria-describedby="inputGroupPrepend"
                            onChange={e => state.current.username = e.target.value}
                            required
                            />
                        <Form.Control.Feedback type="invalid">
                            Username is incorrect
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mt-3" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" 
                        onChange={e => state.current.password = e.target.value}
                        required/>
                        <Form.Control.Feedback type="invalid">
                            Password cannot be empty
                        </Form.Control.Feedback>
                    </Form.Group>
                    {
                        error ? 
                        <Alert variant='danger' className="mt-3">
                            {error}
                        </Alert>
                        :
                        <div className="mb-5"></div>
                }
                    <div className='loginButtons'>
                        <div onClick={() => setIsRegister(true)}>Request account</div>
                        <Button variant="primary" type="submit" className='submitButton'>
                            Log in
                        </Button>
                    </div>

                </Form>

            </div>
        </>  
    )
}