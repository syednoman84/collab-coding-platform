import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://192.168.1.196:8080/api/questions'; // Adjust to your backend URL

export default function AdminQuestionManager() {
    const [questions, setQuestions] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [newQuestion, setNewQuestion] = useState({
        title: '',
        description: '',
        starterCode: '',
        testCases: [{ input: '', output: '' }]
    });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        const res = await fetch(API_BASE_URL);
        const data = await res.json();
        setQuestions(data);
    };

    const handleDelete = async (id) => {
        await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        fetchQuestions();
    };

    const handleEdit = (question) => {
        setEditingQuestion(question);
        setNewQuestion(question);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingQuestion(null);
        setNewQuestion({
            title: '',
            description: '',
            starterCode: '',
            testCases: [{ input: '', output: '' }]
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingQuestion ? 'PUT' : 'POST';
        const url = editingQuestion ? `${API_BASE_URL}/${editingQuestion.id}` : API_BASE_URL;
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newQuestion)
        });
        setShowForm(false);
        fetchQuestions();
    };

    const handleTestCaseChange = (index, field, value) => {
        const updatedTestCases = [...newQuestion.testCases];
        updatedTestCases[index][field] = value;
        setNewQuestion({ ...newQuestion, testCases: updatedTestCases });
    };

    const addTestCaseField = () => {
        setNewQuestion({ ...newQuestion, testCases: [...newQuestion.testCases, { input: '', output: '' }] });
    };

    const handleActivate = async (id) => {
        await fetch(`${API_BASE_URL}/activate/${id}`, { method: 'POST' });
        alert('Question activated!');
      };
      
      const handleClearActive = async () => {
        await fetch(`${API_BASE_URL}/clear`, { method: 'POST' });
        alert('Active question cleared!');
      };
      
    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Question Management</h1>

            <button onClick={handleClearActive} style={{ marginBottom: '20px', marginLeft: '10px' }}>❌ Clear Active Question</button>
            <button onClick={handleAddNew} style={{ marginBottom: '20px' }}>Add New Question</button>

            <ul>
                {questions.map((q) => (
                    <li key={q.id} style={{ marginBottom: '10px' }}>
                        <strong>{q.title}</strong> - {q.description.substring(0, 50)}...
                        <button onClick={() => handleEdit(q)} style={{ marginLeft: '10px' }}>✏️ Edit</button>
                        <button onClick={() => handleDelete(q.id)} style={{ marginLeft: '10px' }}>🗑 Delete</button>
                        <button onClick={() => handleActivate(q.id)} style={{ marginLeft: '10px' }}>🚀 Activate</button>

                    </li>
                ))}
            </ul>

            {showForm && (
                <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                    <h3>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
                    <input
                        type="text"
                        placeholder="Title"
                        value={newQuestion.title}
                        onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                        required
                        style={{ display: 'block', marginBottom: '10px', width: '400px' }}
                    />
                    <textarea
                        placeholder="Description"
                        value={newQuestion.description}
                        onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                        required
                        style={{ display: 'block', marginBottom: '10px', width: '400px', height: '100px' }}
                    />
                    <textarea
                        placeholder="Starter Code"
                        value={newQuestion.starterCode}
                        onChange={(e) => setNewQuestion({ ...newQuestion, starterCode: e.target.value })}
                        required
                        style={{ display: 'block', marginBottom: '10px', width: '400px', height: '100px' }}
                    />

                    <h4>Test Cases</h4>
                    {newQuestion.testCases.map((tc, idx) => (
                        <div key={idx} style={{ marginBottom: '10px' }}>
                            <input
                                type="text"
                                placeholder="Input"
                                value={tc.input}
                                onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                                required
                                style={{ marginRight: '10px' }}
                            />
                            <input
                                type="text"
                                placeholder="Output"
                                value={tc.output}
                                onChange={(e) => handleTestCaseChange(idx, 'output', e.target.value)}
                                required
                            />
                        </div>
                    ))}
                    <button type="button" onClick={addTestCaseField} style={{ marginBottom: '10px' }}>➕ Add Test Case</button>
                    <br />
                    <button type="submit">{editingQuestion ? 'Update Question' : 'Add Question'}</button>
                </form>
            )}
        </div>
    );
}
