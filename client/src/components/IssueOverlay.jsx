import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { API } from '../util';

export default function IssueOverlay({ show, handleClose, allUsers, currentUser }) {
    const [isSaving, setIsSaving] = useState(false);

    
    const [form, setForm] = useState({
        reportTitle: "",
        reportDescription: "",
        proirityId: 1, 
        assigneeId: allUsers[0].USER_ID
    });

    const isValid = form.reportTitle.trim().length > 0 && form.reportDescription.trim().length > 0;

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleCreate = async () => {
        if (!isValid || isSaving) return;
        
        setIsSaving(true);
        
        console.log({...form, creatorId:currentUser.USER_ID});
        
        const response = await fetch(new URL("add-issue", API), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...form,
                        creatorId: currentUser.USER_ID
                    })
                });
            
        if(response.ok){
            setIsSaving(false);
            setForm({ reportTitle: "", reportDescription: "", proirityId: 1, assigneeId: allUsers[0].USER_ID}); // Reset
            handleClose();
        }
    };

    const prioDict = ["Low", "Medium", "High", "Critical"];

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Create New Issue</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
                    <Form.Group className="mb-3">
                        <Form.Label>Issue Title</Form.Label>
                        <Form.Control 
                            required
                            type="text" 
                            placeholder="Brief summary of the problem"
                            value={form.reportTitle}
                            onChange={(e) => handleChange('reportTitle', e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Detailed Description</Form.Label>
                        <Form.Control 
                            required
                            as="textarea" 
                            rows={5} 
                            placeholder="Steps to reproduce, expected vs actual result..."
                            value={form.reportDescription}
                            onChange={(e) => handleChange('reportDescription', e.target.value)}
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Priority</Form.Label>
                                <Form.Select 
                                    required
                                    value={form.proirityId}
                                    onChange={(e) => handleChange('proirityId', parseInt(e.target.value))}
                                >
                                    {[1, 2, 3, 4].map(p => (
                                        <option key={p} value={p}>{prioDict[p-1]}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Assign To</Form.Label>
                                <Form.Select 
                                    required
                                    value={form.assigneeId}
                                    onChange={(e) => handleChange('assigneeId', e.target.value)}
                                >
                                    {allUsers?.map(user => (
                                        <option key={user.USER_ID} value={user.USER_ID}>
                                            {user.USERNAME} ({user.NAME})
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
                    Cancel
                </Button>
                <Button 
                    variant={isValid ? "success" : "secondary"} 
                    disabled={!isValid || isSaving}
                    onClick={handleCreate}
                >
                    {isSaving ? <Spinner animation="border" size="sm" /> : "Create Issue"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}