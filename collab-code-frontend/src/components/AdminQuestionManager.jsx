import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://192.168.1.196:8080/api/questions'; // Adjust to your backend URL

function generateStarterCode(className, methodName, parameters, returnType) {
    const paramList = parameters.join(', ');
    return `public class ${className} {
      public ${returnType} ${methodName}(${paramList}) {
          // your code here
      }
  }`;
}

export default function AdminQuestionManager() {
    const [questions, setQuestions] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [newQuestion, setNewQuestion] = useState({
        title: '',
        description: '',
        className: 'Solution',
        methodName: '',
        returnType: '',
        parameters: '',
        starterCode: '',
        testCases: [{ input: '', expectedOutput: '' }]
    });
    const [showForm, setShowForm] = useState(false);
    const [activeProblemId, setActiveProblemId] = useState(null);


    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        const res = await fetch(API_BASE_URL);
        const data = await res.json();
        setQuestions(data);

        // fetch active question
        const activeRes = await fetch(`${API_BASE_URL}/active`);
        const activeData = await activeRes.json();
        setActiveProblemId(activeData?.id || null);
    };


    const handleDelete = async (id) => {
        await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        fetchQuestions();
    };

    const handleEdit = (question) => {
        setEditingQuestion(question);
        setNewQuestion({
            title: question.title || '',
            description: question.description || '',
            className: question.className || 'Solution',
            methodName: question.methodName || '',
            returnType: question.returnType || '',
            parameters: question.parameters?.join(', ') || '',
            starterCode: question.starterCode || '',
            testCases: question.testCases || [{ input: '', expectedOutput: '' }]
        });
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingQuestion(null);
        setNewQuestion({
            title: '',
            description: '',
            className: 'Solution',
            methodName: '',
            returnType: '',
            parameters: '',
            starterCode: '',
            testCases: [{ input: '', expectedOutput: '' }]
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingQuestion ? 'PUT' : 'POST';
        const url = editingQuestion ? `${API_BASE_URL}/${editingQuestion.id}` : API_BASE_URL;
        const payload = {
            ...newQuestion,
            parameters: newQuestion.parameters.split(',').map(p => p.trim()),
            testCases: newQuestion.testCases.map(tc => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput
            }))
        };
        console.log("Submitting payload:", payload);

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
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
        setNewQuestion({ ...newQuestion, testCases: [...newQuestion.testCases, { input: '', expectedOutput: '' }] });
    };

    const handleActivate = async (id) => {
        await fetch(`${API_BASE_URL}/activate/${id}`, { method: 'POST' });
        alert('Question activated!');
    };

    const handleClearActive = async () => {
        await fetch(`${API_BASE_URL}/clear`, { method: 'POST' });
        alert('Active question cleared!');
    };

    function handleInputChange(e) {
        const { name, value } = e.target;
        const updated = { ...newQuestion, [name]: value };

        const allFilled =
            updated.className &&
            updated.methodName &&
            updated.returnType &&
            updated.parameters;

        if (["className", "methodName", "returnType", "parameters"].includes(name) && allFilled) {
            const paramList = updated.parameters.split(',').map(p => p.trim());
            updated.starterCode = generateStarterCode(
                updated.className,
                updated.methodName,
                paramList,
                updated.returnType
            );
        }

        setNewQuestion(updated);
    }

    const thStyle = {
        border: '1px solid #ccc',
        padding: '8px',
        backgroundColor: '#f2f2f2',
        textAlign: 'left'
      };
      
      const tdStyle = {
        border: '1px solid #ddd',
        padding: '8px',
        verticalAlign: 'top'
      };
      
    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Question Management</h1>

            <button onClick={handleClearActive} style={{ marginBottom: '20px', marginLeft: '10px' }}>❌ Clear Active Question</button>
            <button onClick={handleAddNew} style={{ marginBottom: '20px' }}>Add New Question</button>

            {/* Questions table starts */}
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                    <tr>
                        <th style={thStyle}>#</th>
                        <th style={thStyle}>Title</th>
                        <th style={thStyle}>Description</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {questions.map((q, index) => (
                        <tr key={q.id} style={q.id === activeProblemId ? { backgroundColor: '#e6ffe6' } : {}}>
                            <td style={tdStyle}>{index + 1}</td>
                            <td style={tdStyle}>{q.title}</td>
                            <td style={tdStyle}>{q.description.slice(0, 80)}...</td>
                            <td style={tdStyle}>
                                {q.id === activeProblemId && <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Active</span>}
                            </td>
                            <td style={tdStyle}>
                                <button onClick={() => handleEdit(q)} style={{ marginRight: '8px' }}>✏️ Edit</button>
                                <button onClick={() => handleDelete(q.id)} style={{ marginRight: '8px' }}>🗑 Delete</button>
                                <button onClick={() => handleActivate(q.id)}>🚀 Activate</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Questions table ends */}


            {showForm && (
                <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                    <h3>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>

                    <input name="title" placeholder="Title" value={newQuestion.title} onChange={handleInputChange} required style={{ display: 'block', marginBottom: '10px', width: '400px' }} />
                    <textarea name="description" placeholder="Description" value={newQuestion.description} onChange={handleInputChange} required style={{ display: 'block', marginBottom: '10px', width: '400px', height: '100px' }} />
                    <input name="className" placeholder="Class Name" value={newQuestion.className} onChange={handleInputChange} required style={{ display: 'block', marginBottom: '10px', width: '400px' }} />
                    <input name="methodName" placeholder="Method Name" value={newQuestion.methodName} onChange={handleInputChange} required style={{ display: 'block', marginBottom: '10px', width: '400px' }} />
                    <input name="returnType" placeholder="Return Type" value={newQuestion.returnType} onChange={handleInputChange} required style={{ display: 'block', marginBottom: '10px', width: '400px' }} />
                    <input name="parameters" placeholder="Parameters (comma separated)" value={newQuestion.parameters} onChange={handleInputChange} required style={{ display: 'block', marginBottom: '10px', width: '400px' }} />

                    <button
                        type="button"
                        onClick={() => {
                            const paramList = newQuestion.parameters.split(',').map(p => p.trim());
                            const starter = generateStarterCode(
                                newQuestion.className,
                                newQuestion.methodName,
                                paramList,
                                newQuestion.returnType
                            );
                            setNewQuestion(prev => ({ ...prev, starterCode: starter }));
                        }}
                        style={{ marginBottom: '10px' }}
                    >
                        ⚙️ Generate Starter Code
                    </button>

                    <textarea name="starterCode" placeholder="Starter Code" value={newQuestion.starterCode} onChange={handleInputChange} required style={{ display: 'block', marginBottom: '10px', width: '400px', height: '100px' }} />

                    <h4>Test Cases</h4>
                    {newQuestion.testCases.map((tc, idx) => (
                        <div key={idx} style={{ marginBottom: '10px' }}>
                            <input type="text" placeholder="Input" value={tc.input} onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)} required style={{ marginRight: '10px' }} />
                            <input type="text" placeholder="Expected Output" value={tc.expectedOutput} onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)} required />
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
