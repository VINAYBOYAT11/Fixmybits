import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

const Card = ({ 
  children, 
  variant = 'default',
  hoverable = false,
  className = '',
  ...props 
}) => {
  const classes = [
    'card',
    `card--${variant}`,
    hoverable ? 'card--hoverable' : '',
    className
  ].filter(Boolean).join(' ');

  const MotionCard = hoverable ? motion.div : 'div';
  const motionProps = hoverable ? {
    whileHover: { y: -4, boxShadow: 'var(--shadow-xl)' },
    transition: { duration: 0.2 }
  } : {};

  return (
    <MotionCard className={classes} {...motionProps} {...props}>
      {children}
    </MotionCard>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`card-content ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
