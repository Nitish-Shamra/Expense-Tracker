import React from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <>
    
    <div className='navbar'>
    <div className='logo'>
        Expense Tracker
        </div>
        <nav className='nav'> 
          <div >
                <NavLink to= "/" >Home</NavLink>
          </div>
            
            <div >
                <NavLink to= "/download" >Download Records</NavLink>
             </div>
             <div >
                <NavLink to= "/about" >About</NavLink>
             </div> 
             <div >
                <NavLink to= "/contact us" >Contact Us</NavLink>
             </div>
             
        </nav>
    </div>
    </>
  )
}

export default Navbar
