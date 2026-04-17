import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, WarningCircle, Info } from '@phosphor-icons/react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        
        setTimeout(() => {
            setToasts((prev) => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container" style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {toasts.map(toast => {
                    let Icon = Info;
                    let colorClass = 'info';
                    
                    if (toast.type === 'success') { Icon = CheckCircle; colorClass = 'success'; }
                    if (toast.type === 'danger') { Icon = WarningCircle; colorClass = 'danger'; }
                    if (toast.type === 'warning') { Icon = WarningCircle; colorClass = 'warning'; }

                    return (
                        <div key={toast.id} className={`toast toast-${colorClass}`} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-md)',
                            minWidth: '300px',
                            animation: 'slideIn 0.3s ease-out forwards'
                        }}>
                            <Icon size={24} color={`var(--${colorClass})`} weight="fill" />
                            <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.4' }}>
                                {toast.message}
                            </div>
                            <button onClick={() => removeToast(toast.id)} style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '4px'
                            }}>
                                <X size={20} />
                            </button>
                        </div>
                    );
                })}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
