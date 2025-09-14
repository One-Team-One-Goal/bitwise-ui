import React from 'react'

interface UserRoleButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
}

const UserRoleButton = ({
  children,
  type = 'button',
  onClick,
  className = '',
}: UserRoleButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`font-bold w-16 h-16 p-16 rounded-md flex items-center justify-center ${className}`} // Set width and height to make it square // Adjusted padding and border radius
    >
      {children}
    </button>
  )
}

export default UserRoleButton
