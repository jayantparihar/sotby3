import { useState } from 'react'
import { ReactSession } from 'react-client-session';
import styles from './create_resource.module.css'
import './create_resource.module.css'
import React from 'react'
import "react-datepicker/dist/react-datepicker.css";
import AdminNav from "../../src/components/AdminNav";
import { Link } from 'react-router-dom'
import logo from '../images/BCIT_logo.png'

function isAdmin() {
    let userStatus = ReactSession.get("admin");
    if (userStatus === 1) {
        return true;
    }
    return false;
}

function Create_resource(socket) {
    socket = socket.socket;
    const [model_num, setModelNum] = useState('');
    const [model_name, setModelName] = useState('');
    const [quantity_total, setQuantityTotal] = useState('');
    const [model_location, setModelLocation] = useState('');

    const create_resource = (e) => {
        e.preventDefault();
        document.getElementById("successMessage").style.color = 'Red';
        document.getElementById("successMessage").style.fontWeight= 'Bold';
        if (!model_num) {
            document.getElementById("successMessage").innerText = "Please enter a model number.";
            return;
        }

        if (!model_name) {
            document.getElementById("successMessage").innerText = "Please enter a model name.";
            return;
        }

        if (!quantity_total || isNaN(quantity_total) || quantity_total <= 0) {
            document.getElementById("successMessage").innerText = "Please enter a valid quantity";
            return;
        }

        if (!model_location) {
            document.getElementById("successMessage").innerText = "Please enter a model location.";
            return;
        }

        const new_resource = {
            model_num: model_num,
            model_name: model_name,
            quantity_total: quantity_total,
            model_location: model_location
        };
        socket.emit('resourceAdded', new_resource, null);

        // feedback upon successful creation
        socket.on('resourceAdded', (user) => {
            document.getElementById("successMessage").innerText = "Resource successfully created."
            document.getElementById("successMessage").style.color = 'Green';
            document.getElementById("successMessage").style.fontWeight= 'Bold';
        });

        // displays error msg upon failure 
        socket.on('error', (error) => {
            document.getElementById("successMessage").innerText = "An error has occured! Please check your inputs.";
            document.getElementById("successMessage").style.color = 'Red';
            document.getElementById("successMessage").style.fontWeight= 'Bold';

        });
    }

    return isAdmin() ? (
        <>
        <AdminNav></AdminNav>
        <label><br/></label>
        <div align="center">
            <Link to="/"><img src={logo} alt='logo' height="150" width="170" ></img></Link>
            </div>
                    <form onSubmit={create_resource} className={styles['resource-form']}>
                        <h2>Create Resource</h2>
                        <label>
        <span>Model Number:</span>
        <input
                            className="new-resource-input"
                            type="text"
                            placeholder="Model Number..."
                            value={model_num}
                            onChange={(e) => setModelNum(e.target.value)} />
              </label>
              <label>
        <span>Model Name:</span>
        <input
                            className="new-resource-input"
                            type="text"
                            placeholder="Model Name..."
                            value={model_name}
                            onChange={(e) => setModelName(e.target.value)} />
              </label>
              <label>
        <span>Quantity Total:</span>
        <input
                            className="new-resource-input"
                            type="text"
                            placeholder="Quantity Total..."
                            value={quantity_total}
                            onChange={(e) => setQuantityTotal(e.target.value)}/>
              </label>
              <label>
        <span>Model Location:</span>
        <input
                            className="new-resource-input"
                            type="text"
                            placeholder="Model Location..."
                            value={model_location}
                            onChange={(e) => setModelLocation(e.target.value)}/>
              </label>
        <button >Create Resource</button>
        <p id="successMessage"></p>
                    </form>
                    </>
    ) : window.location.href = "/"
}

export default Create_resource
