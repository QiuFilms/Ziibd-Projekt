import { useContext, useEffect, useRef, useState } from "react"
import "../Issue.css"
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import { User } from "../App";
import { API } from "../util";

export default function Issue({issue, allUsers, setOpenFunction, refreshIssues}){
    const titleRef = useRef(null);
    const descRef = useRef(null);
    const [user, setUser] = useContext(User)

    const [showA, setShowA] = useState(false);
    const [showB, setShowB] = useState(false);

    const toggleShowA = () => setShowA(!showA);
    const toggleShowB = () => setShowB(!showB);

    const editFields = useRef({
        assignee: allUsers[allUsers.findIndex(subarray => subarray.USERNAME === issue.ASSIGNEE_NAME)].USER_ID,
        priority: issue.PRIORITY_ID,
        status: issue.STATUS_ID
    });


    const handleClose = () => {
        setOpenFunction(null)
    }

    const handleSave = async () => {
        const updatedTitle = titleRef.current.innerText;
        const updatedDesc = descRef.current.innerText;
        
        if(updatedTitle == issue.TITLE 
            && updatedDesc == issue.DESCRIPTION
            && editFields.current.priority == issue.PRIORITY_ID
            && editFields.current.status == issue.STATUS_ID
            && editFields.current.assignee == allUsers[allUsers.findIndex(subarray => subarray.USERNAME === issue.ASSIGNEE_NAME)].USER_ID
        ) return

        
        const response = await fetch(new URL("update-issue", API), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        reportId: issue.REPORT_ID,
                        editorId: user.USER_ID,
                        reportTitle: updatedTitle,
                        reportDescription: updatedDesc,
                        proirityId: editFields.current.priority,
                        statusId: editFields.current.status,
                        assigneeId: editFields.current.assignee
                    })
                });
            
        if(response.ok){
            toggleShowA()
            refreshIssues()        
        }else{
            toggleShowB()
        }
    }

    return(
        <div className="Issue">
            <div className="reportButtons">
                <div className="backButton" onClick={handleClose}> {"<"} Back</div>
            </div>

            <div className="title">
                <p className="reportId">#{issue.REPORT_ID}</p>
                <p className="reportTitle" contentEditable spellCheck={false} ref={titleRef}>{issue.TITLE}</p>
                <div className="outerSaveButton">
                </div>

            </div>

            <div className="innerContents">
                <div className="description" contentEditable spellCheck={false} ref={descRef}>{issue.DESCRIPTION}</div>
                <div className="informations">
                    
                    <div className="ReportCreator mb-3">Created by: <br/> 
                        {allUsers ? 
                            allUsers.map(user => {
                                if(user.USERNAME == issue.CREATOR_NAME){
                                    return `${user.USERNAME} (${user.NAME})`
                                }
                            })
                            :
                            <></>
                        }
                    </div>
                    <div className="creationDate mb-3">Creation date: <br/> {new Date(issue.CREATION_DATE).toLocaleDateString('en-GB')}</div>

                    <div className="assigee">Assigned to: 
                        <Form.Select aria-label="Default select example" id='createdBy' className='userSelect mb-3'
                        onChange={e => editFields.current.assignee = e.target.value}
                        >
                            {allUsers ? 
                                allUsers.map(user => {
                                    if(user.USERNAME == issue.ASSIGNEE_NAME){
                                        return <option value={user.USER_ID} selected="selected">{`${user.USERNAME} (${user.NAME})`}</option>
                                    }
                                    return <option value={user.USER_ID}>{`${user.USERNAME} (${user.NAME})`}</option>
                                })
                                :
                                <></>
                            }
                        </Form.Select>
                    </div>
                    <div className="priority">Priority: 
                        <Form.Select aria-label="Default select example" id='priority' className='statusPrioSelect mb-3'
                        onChange={e => editFields.current.priority = e.target.value}
                        >
                            {
                                [1, 2, 3, 4].map(priority => {
                                    if(priority == issue.PRIORITY_ID){
                                        return <option value={priority} selected="selected">{prioDict[priority - 1]}</option>
                                    }
                                    return <option value={priority}>{prioDict[priority - 1]}</option>
                                })
                            }
                        </Form.Select>
                    </div>
                    <div className="status">Status: 
                        <Form.Select aria-label="Default select example" id='status' className='statusPrioSelect mb-3'
                        onChange={e => editFields.current.status = e.target.value}
                        >
                            {
                                [1, 2].map(status => {
                                    if(status == issue.STATUS_ID){
                                        return <option value={status} selected="selected">{status == 1 ? "Open" : "Closed"}</option>
                                    }
                                    return <option value={status}>{status == 1 ? "Open" : "Closed"}</option>
                                })
                            }
                        </Form.Select>
                    </div>

                    <Button variant="primary" className="saveButton mt-4" onClick={handleSave}>Save</Button>

                </div>
                {/* <div className="history">
                    <div className="historyEntry">
                        <div className="date"></div>
                        <div className="status"></div>
                    </div>
                </div> */}
            </div>
            {
                showA ? 
                    <Toast onClose={toggleShowA} animation={true}>
                        <Toast.Header>
                            <img src="holder.js/20x20?text=%20" className="rounded me-2 toast" alt="" />
                            <strong className="me-auto">Event</strong>
                        </Toast.Header>
                        <Toast.Body>Issue updated correctly</Toast.Body>
                    </Toast>
                :
                <></>
            }

            {
                showB ? 
                    <Toast onClose={toggleShowB} animation={true}>
                        <Toast.Header>
                            <img src="holder.js/20x20?text=%20" className="rounded me-2 toast" alt="" />
                            <strong className="me-auto">Event</strong>
                        </Toast.Header>
                        <Toast.Body>Update failed</Toast.Body>
                    </Toast>
                :
                <></>
            }
        </div>
    )
}

const prioDict = ["Low", "Medium", "High", "Critical"]