import React from 'react';
import '../navbar.css'

function logout() {
    localStorage.clear();
}

const UserNav = ({ title }) => {
    return (
        <ul className="nav-ul">
            <li className='nav-li'><a href="/vacation">Request Vacation</a></li>
            <li className='nav-li' id="logout" onMouseDown={logout}><a href="/">Logout</a></li>
        </ul>
    );
};

UserNav.defaultProps = {
    title: 'Admin Nav',
}

export default UserNav;
