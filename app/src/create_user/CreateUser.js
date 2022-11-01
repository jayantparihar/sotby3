import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminNav from "../../src/components/AdminNav";
import React from 'react'
import { ReactSession } from 'react-client-session';
import logo from '../images/BCIT_logo.png'
// styles
import styles from './createUser.module.css'

function isAdmin() {
  let userStatus = ReactSession.get("admin");
  if (userStatus === 1) {
      return true;
  }
  return false;
}



export default function CreateUser(socket) {
  socket = socket.socket;
  const [username, setUsername] = useState('');
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [admin, setAdmin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

const create_user = (e) => {
        e.preventDefault();
        document.getElementById("successMessage").style.color = 'Red';
        document.getElementById("successMessage").style.fontWeight= 'Bold';
        if (!username) {
            document.getElementById("successMessage").innerText = "Please enter a user name.";
            return;
        }

        if (!firstname || !lastname) {
            document.getElementById("successMessage").innerText = "Please enter a first and last name.";
            return;
        }

        if (!email) {
            document.getElementById("successMessage").innerText = "Please enter an email address.";
            return;
        }

        if (password !== confirmPassword) {
            document.getElementById("successMessage").innerText = "Password does not match confirmed password.";
            return;
        }



        const date = new Date();
        const dateJoined = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

        const new_user = {
            username: username,
            firstname: firstname,
            lastname: lastname,
            datejoined: dateJoined,
            admin: admin ? 1 : 0,
            email: email,
            password: password
        };
        socket.emit('userAdded', new_user, null);

        // feedback upon successful creation
        socket.on('userAdded', (user) => {
            document.getElementById("successMessage").innerText = "User successfully created."
        });

        // displays error msg upon failure 
        socket.on('error', (error) => {
            document.getElementById("successMessage").innerText = "An error has occured! Please check your inputs.";

        });
      }

  return isAdmin() ? (
    <>
    <AdminNav></AdminNav>
    
    <label><br/></label>
    <div align="center">
    <Link to="/"><img src={logo} alt='logo' height="150" width="170" ></img></Link>
    </div>
    <form onSubmit={create_user} className={styles['signup-form']}>
      <h2>Create User</h2>
      <label>
        <span>Username:</span>
        <input 
          type="text" 
          placeholder='FirstName_LastName'
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </label>
      <label>
        <span>First Name:</span>
        <input 
          type="text" 
          placeholder='First Name...'
          onChange={(e) => setFirstName(e.target.value)}
          value={firstname}
        />
      </label>
      <label>
        <span>Last Name:</span>
        <input 
          type="text" 
          placeholder='Last Name...'
          onChange={(e) => setLastName(e.target.value)}
          value={lastname}
        />
      </label>


      <label className={styles['container']}>
        <span>Admin:</span>
        <input 
            type='checkbox'
            value={admin}
            onChange={(e) => setAdmin(e.target.checked)} />
        <span className={styles['checkmark']}></span>
      </label>


      <label>
        <span>Email:</span>
        <input 
          type="email" 
          placeholder='Email...'
          onChange={(e) => setEmail(e.target.value)} 
          value={email}
        />
      </label>
      <label>
        <span>Password:</span>
        <input 
          type="password" 
          placeholder="Password..."
          onChange={(e) => setPassword(e.target.value)} 
          value={password} 
        />
      </label>
      <label>
        <span>Confirm Password:</span>
        <input 
          type="password" 
          placeholder="Confirm password..."
          onChange={(e) => setConfirmPassword(e.target.value)} 
          value={confirmPassword} 
        />
      </label>

      <button className="btn">Create User</button>
      
    <p id="successMessage"></p>
    </form>    
    </> 
  ) : window.location.href = "/";
}
