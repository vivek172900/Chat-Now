import React from 'react'

export default function Star_button({b_name, handleOnclick, classname = ""}) {
    return (
        <button 
            onClick={handleOnclick}
            className={`
                bg-gradient-to-r from-cyan-500 to-purple-600 
                text-white font-semibold
                px-8 py-4 rounded-xl
                hover:from-cyan-600 hover:to-purple-700
                transition-colors duration-300
                ${classname}
            `}
        >
            {b_name}
        </button>
    )
}
