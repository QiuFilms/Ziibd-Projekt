import Form from 'react-bootstrap/Form';
import IssueCard from './IssueCard';
import { useContext, useEffect, useRef, useState } from 'react';
import { User } from "../App";
import Spinner from 'react-bootstrap/Spinner';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import Issue from './Issue';
import IssueOverlay from './IssueOverlay';
import { API } from '../util';


export default function Issues(){
    const [user, setUser] = useContext(User)
    const [issues, setIssues] = useState(null)
    const [allUsers, setAllUsers] = useState(null)
    const [isLoading, setIsLoading] = useState(true);
    const [openedIssue, setOpenedIssue] = useState(null)

    const [showModal, setShowModal] = useState(false);

    const [sortDirection, setSortDirection] = useState("DOWN")

    const [filters, setFilters] = useState({
        orderField: "priority_id",
        orderType: "DESC",
    });

    const searchFields = useRef({
        text:null,
        creator:null,
        assignee: null,
        status: 1,
        priority: null,
    })

    function getIssues(fields = searchFields.current){
        setIsLoading(true)
        setIssues(null)


        fetch(new URL("get-issues", API), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    creatorId: fields.creator,
                    assigneeId: fields.assignee,
                    orderField:filters.orderField,
                    orderType: filters.orderType,
                    statusId: fields.status,
                    priorityId: fields.priority,
                    text: fields.text
                })
            })
            .then(res => res.json())
            .then(res => {
                setIssues(res.data)
                setIsLoading(false)
            });
    }

    useEffect(() => {
        if(showModal == false){
            getIssues()
        }

    }, [showModal])

    useEffect(() => {
        fetch(new URL("users", API)).then(res => res.json()).then(res => setAllUsers(res.data))
    }, [])

    function handleSearch(e){
        e.preventDefault()

        if(!isLoading){
            getIssues()
        }
    }

    function handleOrderChange(e, field){
        const temp = structuredClone(filters)
        temp.orderField = field

        if(filters.orderField != field || (filters.orderField == field && filters.orderType == "DESC")){
            temp.orderType = "ASC"
            setSortDirection("down")
        }else{
            temp.orderType = "DESC"
            setSortDirection("up")
        }
        
        setFilters(temp)
    }

    
    const dict = {
        report_id: 0,
        description: 1,
        priority_id:2,
        status_id:5
    }

    useEffect(() => {
        if (issues == null) return;

        const newOrder = [...issues].sort((a, b) => {
            const field = filters.orderField.toUpperCase(); 
            const valA = a[field];
            const valB = b[field];

            let comparison = 0;

            if (typeof valA === "string") {
                comparison = valA.localeCompare(valB);
            } else {
                comparison = (valA || 0) - (valB || 0);
            }

            return filters.orderType === "ASC" ? comparison : -comparison;
        });
        
        setIssues(newOrder)
    }, [filters.orderField, filters.orderType])


    const handleChange = (e, func) => {
        func()
        handleSearch(e)
    }


    return(
        <>
            { openedIssue ?
                <Issue issue={openedIssue} allUsers={allUsers} setOpenFunction={setOpenedIssue} refreshIssues={getIssues}/>
                :
                <div className="Issues">

                    <div >
                        <Form noValidate validated={0} onSubmit={handleSearch} className="filters">
                            <Form.Group>
                                <Form.Label htmlFor="searchInput">Search</Form.Label>
                                <Form.Control
                                    type="search"
                                    id="searchInput"
                                    placeholder="Search issue..."
                                    onChange={e => searchFields.current.text = e.target.value}
                                />
                            </Form.Group>

                            <Button variant="primary" className='searchButton' type='submit'>Search</Button>

                            <Form.Group className="filterGroup creatorGroup">
                                <Form.Label htmlFor="createdBy">Created by</Form.Label>
                                <Form.Select aria-label="Default select example" id='createdBy' className='userSelect'
                                onChange={e => handleChange(e, () => searchFields.current.creator = e.target.value === "" ? null : e.target.value)}
                                >
                                    <option value="">Any</option>
                                    {allUsers ? 
                                        allUsers.map(user => {
                                            return <option value={user.USER_ID}>{`${user.USERNAME} (${user.NAME})`}</option>
                                        })
                                        :
                                        <></>
                                    }
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="filterGroup">
                                <Form.Label htmlFor="assignedTo">Assigned to</Form.Label>
                                <Form.Select aria-label="Default select example" id='assignedTo' className='userSelect'
                                onChange={e => handleChange(e, () => searchFields.current.assignee = e.target.value === "" ? null : e.target.value)}
                                >
                                    <option value="">Any</option>
                                    {allUsers ? 
                                        
                                        allUsers.map(user => {
                                            return <option value={user.USER_ID}>{`${user.USERNAME} (${user.NAME})`}</option>
                                        })
                                        :
                                        <></>
                                    }
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="filterGroup">
                                <Form.Label htmlFor="priority">Priority</Form.Label>
                                <Form.Select aria-label="Default select example" id='priority' className='statusPrioSelect'
                                onChange={e => handleChange(e, () => searchFields.current.priority = e.target.value === "" ? null : e.target.value)}
                                >
                                    <option value="">Any</option>
                                    <option value="4">Critical</option>
                                    <option value="3">High</option>
                                    <option value="2">Medium</option>
                                    <option value="1">Low</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="filterGroup">
                                <Form.Label htmlFor="status">Status</Form.Label>
                                <Form.Select aria-label="Default select example" id='status' className='statusPrioSelect'
                                onChange={e => handleChange(e, () => searchFields.current.status = e.target.value === "" ? null : e.target.value)}
                                >
                                    <option value="">Any</option>
                                    <option value="1" selected="selected">Open</option>
                                    <option value="2">Closed</option>
                                </Form.Select>
                            </Form.Group>
                        </Form>
                        {/* <input type="date" name="" id="" /> */}
                    </div>
                    
                    <Button variant="secondary" className='createButton' onClick={() => setShowModal(true)}>Create</Button>

                        {
                            allUsers ? 
                            <IssueOverlay 
                                show={showModal} 
                                handleClose={() => setShowModal(false)}
                                allUsers={allUsers}
                                currentUser={user}
                            />
                            :
                            <></>
                        }
 

                    <div className="issuesColumnNames">
                        <Dropdown className={`filterOrder id
                        ${filters.orderField === "report_id" ? "active-filter" : "inactive-filter"}`} onClick={(e) => handleOrderChange(e, "report_id")} 
                        as={filters.orderField == "report_id" ? undefined : "div"} 
                        drop={filters.orderField == "report_id" ? sortDirection : undefined}>
                            <Dropdown.Toggle as="div" id="dropdown-basic" className='id'>
                                ID
                            </Dropdown.Toggle>
                        </Dropdown>

                        <Dropdown className={`filterOrder title
                        ${filters.orderField === "description" ? "active-filter" : "inactive-filter"}`} onClick={(e) => handleOrderChange(e, "description")} 
                        as={filters.orderField == "description" ? undefined : "div"} 
                        drop={filters.orderField == "description" ? sortDirection : undefined}>
                            <Dropdown.Toggle as="div" id="dropdown-basic" className='id'>
                                Title
                            </Dropdown.Toggle>
                        </Dropdown>

                        {/* <div className="title">Title</div> */}
                        <div className="assignee">Assigned to</div>
                        <div className="creator">Created by</div>

                        <Dropdown className={`filterOrder priority
                        ${filters.orderField === "priority_id" ? "active-filter" : "inactive-filter"}`} onClick={(e) => handleOrderChange(e, "priority_id")} 
                        as={filters.orderField == "priority_id" ? undefined : "div"} 
                        drop={filters.orderField == "priority_id" ? sortDirection : undefined}>
                            <Dropdown.Toggle as="div" id="dropdown-basic" className='id'>
                                Priority
                            </Dropdown.Toggle>
                        </Dropdown>

                        <Dropdown className={`filterOrder status
                        ${filters.orderField === "status_id" ? "active-filter" : "inactive-filter"}`} onClick={(e) => handleOrderChange(e, "status_id")} 
                        as={filters.orderField == "status_id" ? undefined : "div"} 
                        drop={filters.orderField == "status_id" ? sortDirection : undefined}>
                            <Dropdown.Toggle as="div" id="dropdown-basic" className='id'>
                                Status
                            </Dropdown.Toggle>
                        </Dropdown>
                    </div>
                    {
                        issues ? 

                        <div className="outerCards">
                            <div className="issuesCards">      
                                {issues.map(issue => <IssueCard issue={issue} setOpenFunction={setOpenedIssue}/>)}
                            </div>

                        </div>

                        :

                        <div className="outerSpinner">
                            <Spinner animation="border" variant="dark"/>
                        </div>

                    }

                </div>
            }
        </>
        
    )
}