import { useState } from "react";
import './style.css';

function Auth() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    function onFormChange(e) {
        if (e.target.name === 'name') setName(e.target.value);
        else if (e.target.name === 'email') setEmail(e.target.value);        
        else if (e.target.name === 'userId') setUserId(e.target.value);   
        else if (e.target.name === 'password') setPassword(e.target.value);
    }

    function onLogin(e) {
        e.preventDefault(); 
        setMessage("");
        setIsError(false);

        if (userId === 'admin' && password === 'password') {
            console.log(userId);
            window.location.href = './dashboard';
        } else {
            setMessage("Invalid User ID or Password");
            setIsError(true);
        }
    }

    function clearState() {
        setName("");
        setEmail("");
        setUserId("");
        setPassword("");
        setMessage("");
        setIsError(false);
    }

    function toggle() {
        clearState();
    }

    return (
        <div>
            <div className="vh-100 d-flex justify-content-center align-items-center">
                <div style={{ width: "30rem" }} className="card p-3 rounded-3 shadow text-center">
                    <h4 className="mb-3 kanit-regular">SIGN IN</h4>
                    <form onSubmit={onLogin} className="kanit-light">
                        <div className="input-group mb-2">
                            <input 
                                onChange={onFormChange} 
                                className="form-control" 
                                type="text" 
                                name="userId" 
                                placeholder="User ID" 
                                value={userId} 
                            />
                        </div>
                        <div className="input-group mb-3">
                            <input 
                                onChange={onFormChange} 
                                className="form-control" 
                                type="password" 
                                name="password" 
                                placeholder="Password" 
                                value={password} 
                            />
                        </div>
                        <p className="text-primary" style={{ cursor: "pointer" }} onClick={toggle}>Don't have an account? Register</p>
                        <div>
                            <input className="btn btn-outline-primary pt-1 pb-1 mb-2" type="submit" value="Submit" />
                        </div>
                    </form>
                    <div style={isError ? { color: "#dc3545" } : { color: "#28a745" }} className="kanit-light">
                        {message}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;
