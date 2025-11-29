import React from 'react';
import './AudioVisualizer.css';

const AudioVisualizer = ({ isActive }) => {
    return (
        <div className={`visualizer-container ${isActive ? 'active' : ''}`}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
        </div>
    );
};

export default AudioVisualizer;
