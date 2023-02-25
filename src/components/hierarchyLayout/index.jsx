import React from 'react'
import './style.css'

const HierarchyLayout = ({children}) => {
  return (
    <div className='container'>
        {children}
    </div>
  )
}

export default HierarchyLayout