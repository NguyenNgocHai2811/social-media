import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header'; 
import LeftSidebar from '../LeftSidebar/LeftSidebar';

const LayoutAdmin = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            <div className="flex-none z-20 shadow-sm bg-white">
                <Header showSearch={false} showAction={false} /> 
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                <aside className="w-64 flex-none bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
                    {/* Sidebar biến thể dashboard (đã cập nhật ở bước trước) */}
                    <LeftSidebar variant="dashboard" />
                </aside>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default LayoutAdmin;