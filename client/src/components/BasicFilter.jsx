import { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

export default function BasicFilter({name, width}){
    const [direction, setDirection] = useState("Down")

    return(
        <Dropdown drop='up' style={{width:width}}>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
                {name}
            </Dropdown.Toggle>
        </Dropdown>
    )
}