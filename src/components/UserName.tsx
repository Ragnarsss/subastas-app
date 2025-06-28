import React from 'react';
import { useUserName } from '../hooks/useUser';

interface UserNameProps {
  userId: string;
  fallback?: string;
  className?: string;
  showAvatar?: boolean;
}

export const UserName: React.FC<UserNameProps> = ({ 
  userId, 
  fallback, 
  className = "",
  showAvatar = false 
}) => {
  const { userName, loading } = useUserName(userId);

  if (loading) {
    return <span className={className}>Cargando...</span>;
  }

  const displayName = userName || fallback || `Usuario ${userId.substring(0, 8)}`;

  if (showAvatar) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src={`https://ui-avatars.io/api/?name=${encodeURIComponent(displayName)}&background=1976d2&color=fff&size=32`}
          alt={displayName}
          className="w-8 h-8 rounded-full"
        />
        <span>{displayName}</span>
      </div>
    );
  }

  return <span className={className}>{displayName}</span>;
};

export default UserName;
