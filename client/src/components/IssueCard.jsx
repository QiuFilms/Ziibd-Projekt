import { useEffect } from 'react';
import Badge from 'react-bootstrap/Badge';
import user_icon from"../images/user.png"

export default function IssueCard({issue, setOpenFunction}){
    const handlClick = () => {
        setOpenFunction(issue)
    }

    return(
        <div className="IssueCard" onClick={handlClick}>
            <div className="issueId">#{issue.REPORT_ID}</div>
            <div className="issueTitle">{issue.TITLE}</div>
            <div className="issueAssignee">
                <div className="outerImage">
                    <img src={user_icon} alt="" className="profilePicture"/>
                </div>
                {issue.ASSIGNEE_NAME}
            </div>
            <div className="issueCreator">
                <div className="outerImage">
                    <img src={user_icon} alt="" className="profilePicture"/>
                </div>
                {issue.CREATOR_NAME}
            </div>
            <div className="issuePriority">
                <h5>
                    <Badge bg={priorityColors[issue.PRIORITY_ID]}>{prioDict[issue.PRIORITY_ID]}</Badge>
                </h5>
            </div>
            <div className="issueStatus">
                <h5>
                    <Badge bg={statusList[issue.STATUS_ID]}>
                        {
                            issue.STATUS_ID == 1 ? 
                            "Open"
                            :
                            "Closed"
                        }
                    </Badge>
                </h5>
            </div>
        </div>
    )
}

const prioDict = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Critical"
}

const priorityColors = {
    1: "info",
    2: "warning",
    3: "danger",
    4: "dark"
};

const statusList = {
    1: "success",
    2: "secondary"
}
