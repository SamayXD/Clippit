import React from 'react';
import Button from '../ui/Button';

const Header = ({
    sidebarHidden,
    setSidebarHidden,
    showAddForm,
    isLoading
}) => {
    return (
        <div className="flex justify-between items-center p-4 border-b border-[#2A2A2A] bg-gradient-to-r from-[#161616] to-[#1D1D1D]">
            <div className="flex items-center">
                <button
                    onClick={() => setSidebarHidden(!sidebarHidden)}
                    className="mr-3 p-1.5 rounded-md hover:bg-[#333] transition-all duration-200"
                    title={sidebarHidden ? "Show sidebar" : "Hide sidebar"}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {sidebarHidden ? (
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        ) : (
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
                <div className="flex items-center">
                    <img src="/clippit_icon_nbg.png" alt="Clippit" className="w-8 h-8 mr-3" style={{ imageRendering: 'crisp-edges' }} />
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center crisp-text">
                            Clippit <span className="ml-2 text-xs font-normal text-gray-400 bg-[#252525] px-2 py-0.5 rounded">v1.0.0-beta</span>
                        </h1>
                        <div className="text-xs text-gray-400">
                            by <a href="https://github.com/SamayXd" className="text-blue-400 hover:underline hover:text-blue-300" target="_blank" rel="noopener noreferrer">SamayXd</a>
                        </div>
                    </div>
                </div>
            </div>
            <Button
                onClick={showAddForm}
                className="px-3 py-1.5 font-medium"
                disabled={isLoading}
            >
                + Add
            </Button>
        </div>
    );
};

export default Header; 