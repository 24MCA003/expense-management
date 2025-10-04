import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Container, Navbar, Nav, Button, Modal, Form, Table, Badge, Card, Row, Col, Alert, Toast, ToastContainer, Tabs, Tab, Spinner
} from 'react-bootstrap';

// --- MOCK DATA ---
const initialUsers = [
  { id: 1, name: 'Admin User', role: 'Admin', email: 'admin@company.com', password: 'password123', managerId: null },
  { id: 2, name: 'Diana Director', role: 'Director', email: 'director@company.com', password: 'password123', managerId: 1 },
  { id: 3, name: 'Charles CFO', role: 'CFO', email: 'cfo@company.com', password: 'password123', managerId: 2 },
  { id: 4, name: 'John Manager', role: 'Manager', email: 'manager@company.com', password: 'password123', managerId: 3 },
  { id: 5, name: 'Alice Employee', role: 'Employee', email: 'employee@company.com', password: 'password123', managerId: 4 },
  { id: 6, name: 'Bob Employee', role: 'Employee', email: 'employee2@company.com', password: 'password123', managerId: 4 },
];

const initialExpenses = [
  { id: 1, userId: 5, date: '2025-10-03', category: 'Food', description: 'Client Lunch', amount: 55.50, currency: 'USD', status: 'Approved' },
  { id: 2, userId: 5, date: '2025-10-02', category: 'Travel', description: 'Taxi to Airport', amount: 40.00, currency: 'USD', status: 'Rejected', comments: 'Receipt was not clear. Please resubmit with a valid receipt.' },
  { id: 3, userId: 6, date: '2025-10-04', category: 'Office Supplies', description: 'New Keyboard and Mouse', amount: 75.00, currency: 'USD', status: 'Pending' },
  { id: 4, userId: 4, date: '2025-10-05', category: 'Travel', description: 'Flight to Conference', amount: 450.00, currency: 'EUR', status: 'Pending' },
  { id: 5, userId: 3, date: '2025-10-06', category: 'Other', description: 'Industry Subscription Renewal', amount: 1200.00, currency: 'USD', status: 'Pending' },
  { id: 6, userId: 5, date: '2025-09-15', category: 'Food', description: 'Team Dinner', amount: 185.00, currency: 'USD', status: 'Approved' },
];


// --- REUSABLE COMPONENTS ---

const ExpenseList = ({ expenses, users, title, onAction, currentUser, onEdit, onViewDetails }) => {
  const getUserName = (userId) => users.find(u => u.id === userId)?.name || 'Unknown User';
  const getStatusVariant = (status) => ({ 'Approved': 'success', 'Pending': 'warning', 'Rejected': 'danger' })[status] || 'secondary';

  return (
    <Card className="mt-3">
      <Card.Header as="h5">{title}</Card.Header>
      <Card.Body>
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              {currentUser.role !== 'Employee' && <th>Employee</th>}
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.date}</td>
                {currentUser.role !== 'Employee' && <td>{getUserName(expense.userId)}</td>}
                <td>{expense.category}</td>
                <td>{`${expense.amount.toFixed(2)} ${expense.currency}`}</td>
                <td><Badge bg={getStatusVariant(expense.status)}>{expense.status}</Badge></td>
                <td>
                  <Button variant="info" size="sm" onClick={() => onViewDetails(expense)} className="me-2">Details</Button>
                  {onAction && expense.status === 'Pending' && (
                    <>
                      <Button variant="success" size="sm" onClick={() => onAction(expense.id, 'Approved')} className="me-2">Approve</Button>
                      <Button variant="danger" size="sm" onClick={() => onAction(expense.id, 'Rejected')}>Reject</Button>
                    </>
                  )}
                  {onEdit && expense.status === 'Pending' && expense.userId === currentUser.id && (
                    <Button variant="outline-primary" size="sm" onClick={() => onEdit(expense)}>Edit</Button>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="text-center">No expenses found.</td></tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

const ExpenseFormModal = ({ show, onHide, onSave, expenseToEdit }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount);
      setCurrency(expenseToEdit.currency);
      setCategory(expenseToEdit.category);
      setDescription(expenseToEdit.description);
      setDate(expenseToEdit.date);
    } else {
      setAmount('');
      setCurrency('USD');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [expenseToEdit, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: expenseToEdit?.id, amount: parseFloat(amount), currency, category, description, date });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{expenseToEdit ? 'Edit Expense' : 'Submit New Expense'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}><Form.Group className="mb-3"><Form.Label>Amount</Form.Label><Form.Control type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required /></Form.Group></Col>
            <Col md={6}><Form.Group className="mb-3"><Form.Label>Currency</Form.Label><Form.Control type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} required /></Form.Group></Col>
          </Row>
          <Form.Group className="mb-3"><Form.Label>Category</Form.Label><Form.Select value={category} onChange={(e) => setCategory(e.target.value)} required><option value="">Select...</option><option value="Travel">Travel</option><option value="Food">Food</option><option value="Office Supplies">Office Supplies</option><option value="Other">Other</option></Form.Select></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Date</Form.Label><Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2">Cancel</Button>
            <Button variant="primary" type="submit">Save Expense</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const ExpenseDetailsModal = ({ show, onHide, expense, users }) => {
  if (!expense) return null;
  const submitter = users.find(u => u.id === expense.userId);
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton><Modal.Title>Expense Details</Modal.Title></Modal.Header>
      <Modal.Body>
        <p><strong>Submitter:</strong> {submitter?.name || 'Unknown'}</p>
        <p><strong>Date:</strong> {expense.date}</p>
        <p><strong>Category:</strong> {expense.category}</p>
        <p><strong>Amount:</strong> {expense.amount.toFixed(2)} {expense.currency}</p>
        <p><strong>Description:</strong> {expense.description}</p>
        <p><strong>Status:</strong> <Badge bg={{ 'Approved': 'success', 'Pending': 'warning', 'Rejected': 'danger' }[expense.status]}>{expense.status}</Badge></p>
        {expense.status === 'Rejected' && expense.comments && (
          <Alert variant="danger"><strong>Rejection Reason:</strong> {expense.comments}</Alert>
        )}
      </Modal.Body>
      <Modal.Footer><Button variant="secondary" onClick={onHide}>Close</Button></Modal.Footer>
    </Modal>
  );
};


const DashboardSummary = ({ expenses }) => {
  const pendingCount = expenses.filter(e => e.status === 'Pending').length;
  const pendingAmount = expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);
  const approvedThisMonth = expenses.filter(e => e.status === 'Approved' && new Date(e.date).getMonth() === new Date().getMonth()).reduce((sum, e) => sum + e.amount, 0);
  return (
    <Row>
      <Col md={4}><Card bg="warning" text="white" className="mb-3"><Card.Body><Card.Title>{pendingCount}</Card.Title><Card.Text>Pending Expenses</Card.Text></Card.Body></Card></Col>
      <Col md={4}><Card bg="danger" text="white" className="mb-3"><Card.Body><Card.Title>${pendingAmount.toFixed(2)}</Card.Title><Card.Text>Total Pending Amount</Card.Text></Card.Body></Card></Col>
      <Col md={4}><Card bg="success" text="white" className="mb-3"><Card.Body><Card.Title>${approvedThisMonth.toFixed(2)}</Card.Title><Card.Text>Approved This Month</Card.Text></Card.Body></Card></Col>
    </Row>
  );
};

const FilterControls = ({ filterStatus, setFilterStatus }) => (
  <Card className="p-3">
    <Form.Group as={Row} className="align-items-center">
      <Form.Label column sm="2" className="fw-bold">Filter by Status:</Form.Label>
      <Col sm="4">
        <Form.Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="All">All</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option>
        </Form.Select>
      </Col>
    </Form.Group>
  </Card>
);

// --- NEW/UPDATED AUTH COMPONENTS ---

const RegistrationModal = ({ show, onHide, onRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }
    onRegister({ name, email, password, role });
    handleClose();
  };

  const handleClose = () => {
    setError(''); setName(''); setEmail(''); setPassword(''); setRole('Employee');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton><Modal.Title>Register New Account</Modal.Title></Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3"><Form.Label>Full Name</Form.Label><Form.Control type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Email address</Form.Label><Form.Control type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Role (for demo purposes)</Form.Label><Form.Select value={role} onChange={e => setRole(e.target.value)}><option value="Employee">Employee</option><option value="Manager">Manager</option></Form.Select></Form.Group>
          <div className="d-grid"><Button variant="primary" type="submit">Create Account</Button></div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};


const LoginPage = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setRegistering] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    onLogin({ email, password, rememberMe }).catch(err => {
      setError(err.message);
    });
  };

  return (
    <>
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <Card style={{ width: '25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <Card.Body className="p-4 p-md-5">
            <h2 className="text-center mb-4 fw-bold">Welcome Back</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3"><Form.Label>Email address</Form.Label><Form.Control type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Form.Group>
              <Row className="mb-3 align-items-center">
                <Col xs={6}><Form.Check type="checkbox" label="Remember me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /></Col>
                <Col xs={6} className="text-end"><a href="#forgot" onClick={(e) => e.preventDefault()} className="small text-decoration-none">Forgot password?</a></Col>
              </Row>
              <div className="d-grid"><Button variant="primary" type="submit">Sign In</Button></div>
            </Form>
            <hr className="my-4" />
            <div className="text-center">
              <p className="small">
                Don't have an account? <a href="#register" onClick={(e) => { e.preventDefault(); setRegistering(true); }} className="fw-bold text-decoration-none">Sign up here</a>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
      <RegistrationModal show={isRegistering} onHide={() => setRegistering(false)} onRegister={onRegister} />
    </>
  );
};


// --- MAIN APP COMPONENT ---

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(initialUsers);
  const [isLoading, setIsLoading] = useState(true);

  const [expenses, setExpenses] = useState(initialExpenses);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [expenseToView, setExpenseToView] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', variant: 'success' });
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const rememberedUserId = localStorage.getItem('rememberedUserId');
    if (rememberedUserId) {
      const user = users.find(u => u.id === parseInt(rememberedUserId, 10));
      if (user) setCurrentUser(user);
    }
    setIsLoading(false);
  }, [users]);


  const showToast = (message, variant = 'success') => setNotification({ show: true, message, variant });

  const handleLogin = ({ email, password, rememberMe }) => {
    return new Promise((resolve, reject) => {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        setCurrentUser(user);
        if (rememberMe) {
          localStorage.setItem('rememberedUserId', user.id);
        } else {
          localStorage.removeItem('rememberedUserId');
        }
        resolve(user);
      } else {
        reject(new Error('Invalid email or password. Please try again.'));
      }
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rememberedUserId');
  };

  const handleRegister = (newUser) => {
    if (users.some(u => u.email === newUser.email)) {
      showToast("A user with this email already exists.", "danger");
      return;
    }
    // For demo, new employees report to John Manager (id: 4)
    const newUserWithId = { ...newUser, id: Date.now(), managerId: 4 };
    setUsers([...users, newUserWithId]);
    showToast("Registration successful! Please log in.", "success");
  };

  const handleSaveExpense = (expenseData) => {
    if (expenseData.id) {
      setExpenses(expenses.map(exp => exp.id === expenseData.id ? { ...exp, ...expenseData } : exp));
      showToast('Expense updated successfully!', 'info');
    } else {
      const newExpense = { ...expenseData, id: Date.now(), userId: currentUser.id, status: 'Pending' };
      setExpenses([...expenses, newExpense]);
      showToast('New expense submitted!');
    }
    setFormModalOpen(false);
    setExpenseToEdit(null);
  };

  const handleUpdateStatus = (expenseId, status) => {
    let reason = '';
    if (status === 'Rejected') {
      reason = prompt('Please provide a reason for rejection:');
      if (reason === null) return;
    }
    setExpenses(expenses.map(exp => exp.id === expenseId ? { ...exp, status, comments: reason } : exp));
    showToast(`Expense has been ${status.toLowerCase()}.`, status === 'Approved' ? 'success' : 'danger');
  };

  const openEditModal = (expense) => { setExpenseToEdit(expense); setFormModalOpen(true); };
  const openAddNewModal = () => { setExpenseToEdit(null); setFormModalOpen(true); };

  const renderDashboard = () => {
    if (!currentUser) return null;

    const myExpenses = expenses.filter(e => e.userId === currentUser.id && (filterStatus === 'All' || e.status === filterStatus));
    const subordinateIds = users.filter(u => u.managerId === currentUser.id).map(u => u.id);
    const expensesToApprove = expenses.filter(e => subordinateIds.includes(e.userId) && e.status === 'Pending');
    const allCompanyExpenses = expenses.filter(e => filterStatus === 'All' || e.status === filterStatus);

    return (
      <>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 className="h2">{currentUser.role} Dashboard</h1>
          {currentUser.role !== 'Admin' && <Button variant="primary" onClick={openAddNewModal}>+ Add New Expense</Button>}
        </div>
        <p>Welcome, {currentUser.name}! Here is your expense overview.</p>
        <DashboardSummary expenses={currentUser.role === 'Admin' ? allCompanyExpenses : myExpenses.concat(expensesToApprove)} />
        <FilterControls filterStatus={filterStatus} setFilterStatus={setFilterStatus} />

        {['Manager', 'CFO', 'Director'].includes(currentUser.role) ? (
          <Tabs defaultActiveKey="approvals" id="dashboard-tabs" className="mt-4">
            <Tab eventKey="approvals" title={`Approval Queue (${expensesToApprove.length})`}><ExpenseList expenses={expensesToApprove} users={users} title="Expenses Awaiting Your Approval" onAction={handleUpdateStatus} currentUser={currentUser} onViewDetails={setExpenseToView} /></Tab>
            <Tab eventKey="my-expenses" title="My Submissions"><ExpenseList expenses={myExpenses} users={users} title="My Submitted Expenses" currentUser={currentUser} onEdit={openEditModal} onViewDetails={setExpenseToView} /></Tab>
          </Tabs>
        ) : currentUser.role === 'Employee' ? (
          <ExpenseList expenses={myExpenses} users={users} title="My Submitted Expenses" currentUser={currentUser} onEdit={openEditModal} onViewDetails={setExpenseToView} />
        ) : (
          <ExpenseList expenses={allCompanyExpenses} users={users} title="All Company Expenses" currentUser={currentUser} onViewDetails={setExpenseToView} />
        )}

        <ExpenseFormModal show={isFormModalOpen} onHide={() => setFormModalOpen(false)} onSave={handleSaveExpense} expenseToEdit={expenseToEdit} />
        <ExpenseDetailsModal show={!!expenseToView} onHide={() => setExpenseToView(null)} expense={expenseToView} users={users} />
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" role="status"><span className="visually-hidden">Loading...</span></Spinner>
      </div>
    );
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
        <Container>
          <Navbar.Brand href="#">ExpensePro</Navbar.Brand>
          <Nav className="ms-auto">
            {currentUser && (<Navbar.Text className="me-3 d-none d-lg-block">Signed in as: <strong>{currentUser.name} ({currentUser.role})</strong></Navbar.Text>)}
            {currentUser && <Button variant="outline-light" onClick={handleLogout}>Logout</Button>}
          </Nav>
        </Container>
      </Navbar>

      <Container as="main" fluid="lg" className="mt-4">
        {!currentUser ? <LoginPage onLogin={handleLogin} onRegister={handleRegister} /> : renderDashboard()}
      </Container>

      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 11 }}>
        <Toast onClose={() => setNotification({ ...notification, show: false })} show={notification.show} delay={4000} autohide bg={notification.variant}>
          <Toast.Header><strong className="me-auto">Notification</strong></Toast.Header>
          <Toast.Body className={notification.variant === 'light' ? 'text-dark' : 'text-white'}>{notification.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default App;