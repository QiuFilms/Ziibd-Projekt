import { useRef, useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { SiHelpscout } from "react-icons/si";
import Alert from 'react-bootstrap/Alert';
import { API } from "../util";

export default function Register({setIsRegister}){
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState(null);
    
    const state = useRef({
            username:"",
            password:"",
            firstName:"",
            lastName:"",
            role:""
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
                    console.log("Fetching table info...");

                    const response = await fetch(new URL("login", API), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    username:state.current.username,
                                    firstName: state.current.firstName,
                                    lastName: state.current.lastName,
                                    password: state.current.password,
                                    role: state.current.role
                                })
                            });

                    await response.json()
                    if(response.ok){
                        setError({
                            variant:"success",
                            text:"Account granted. Log in into your account"
                        })
                    }
                    setValidated(true);
                } catch (error) {
                    setValidated(false);
                    setError({
                        variant:"danger",
                        text:"Something went wrong..."
                    })
                    return
                }
            };

            fetchData();

        }

        setValidated(true);
    };

    return(
        <>
            <div className="logo logoRegister">
                <SiHelpscout className='logoIcon'/>
                <div className="name">
                    HD Equilibrium
                </div>
            </div>

            <div className='login register'>
                <h2>Request Account</h2>
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

                    <Form.Group className="mt-4 formElem" controlId="firstName">
                        <Form.Label>First name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter first name"
                            aria-describedby="inputGroupPrepend"
                            onChange={e => state.current.firstName = e.target.value}
                            required
                            />
                        <Form.Control.Feedback type="invalid">
                            First name is empty
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mt-4 formElem" controlId="lastName">
                        <Form.Label>Last name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter last name"
                            aria-describedby="inputGroupPrepend"
                            onChange={e => state.current.lastName = e.target.value}
                            required
                            />
                        <Form.Control.Feedback type="invalid">
                            Last name is empty
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
                     
                    <Form.Group className="mt-3" controlId="password">
                        <Form.Label>Role</Form.Label>
                        <Form.Select aria-label="Default select example" 
                        onChange={e => state.current.role = e.target.value}
                        required>
                            <option value="1">Support</option>
                            <option value="2">Engineer</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            Select the role
                        </Form.Control.Feedback>
                    </Form.Group>
                    {
                        error ? 
                        <Alert variant={error.variant} className="mt-3">
                            {error.text}
                        </Alert>
                        :
                        <div className="mb-5"></div>
                }
                    <div className='loginButtons mb-3'>
                        <div onClick={() => setIsRegister(false)}>Log In</div>
                        <Button variant="primary" type="submit" className='submitButton'>
                            Request Account
                        </Button>
                    </div>

                </Form>

            </div>
        </>
    )
}