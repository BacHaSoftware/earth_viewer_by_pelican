import React, { useState } from 'react'

const MenuTools = () => {
    const [openPanel, setOpenPanel] = useState('');
    return (
        <div className='menu-tools'>
            <div className="tools">
                <span className='tool tools-view' onClick={() => {
                    if (openPanel !== 'view') {
                        setOpenPanel('view')
                    }
                    else {
                        setOpenPanel('')
                    }
                }}></span>
                <div className='panel' style={{ display: `${openPanel === 'view' ? 'block' : 'none'}` }}>
                </div>
            </div>
            {/* <div className="tools">
                <span className='tool tools-indepth' onClick={() => {
                    if (openPanel !== 'indepth') {
                        setOpenPanel('indepth')
                    }
                    else {
                        setOpenPanel('')
                    }
                }}></span>
                <div className='panel' style={{ display: `${openPanel === 'indepth' ? 'block' : 'none'}` }}>

                </div>
            </div> */}
        </div>
    )
}

export default MenuTools