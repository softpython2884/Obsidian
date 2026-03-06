'use client';

import React from 'react';
import { Users, Crown, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MentionBadgeProps {
  type: 'user' | 'everyone' | 'here';
  userId?: string;
  username?: string;
  roleColor?: string;
  isOwner?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MentionBadge: React.FC<MentionBadgeProps> = ({
  type,
  userId,
  username,
  roleColor = '#B5BAC1',
  isOwner = false,
  onClick,
  className
}) => {
  const getMentionContent = () => {
    switch (type) {
      case 'everyone':
        return {
          text: '@everyone',
          icon: <Users size={14} />,
          color: '#FAA61A',
          bgColor: 'rgba(250, 166, 26, 0.1)'
        };
      case 'here':
        return {
          text: '@here',
          icon: <Users size={14} />,
          color: '#3BA55D',
          bgColor: 'rgba(59, 165, 93, 0.1)'
        };
      case 'user':
      default:
        return {
          text: `@${username || 'Utilisateur'}`,
          icon: isOwner ? <Crown size={12} /> : <AtSign size={14} />,
          color: roleColor,
          bgColor: `${roleColor}20`
        };
    }
  };

  const mention = getMentionContent();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-sm font-medium cursor-pointer transition-all duration-200 hover:opacity-80',
        className
      )}
      style={{
        color: mention.color,
        backgroundColor: mention.bgColor,
        border: `1px solid ${mention.color}20`
      }}
      onClick={handleClick}
      title={type === 'user' ? `Voir le profil de ${username}` : `Mentionner ${mention.text}`}
    >
      {mention.icon}
      <span>{mention.text}</span>
    </span>
  );
};

// Hook pour parser les mentions dans le contenu
export const useMentionParser = () => {
  const parseMentions = (content: string, members: any[] = [], server?: any) => {
    // Regex pour trouver les mentions <@user_id>, @everyone, @here
    const mentionRegex = /<@!?(\d+)>|@(everyone|here)/g;
    
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // Ajouter le texte avant la mention
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>
            {content.slice(lastIndex, match.index)}
          </span>
        );
      }

      const fullMatch = match[0];
      const userId = match[1];
      const specialMention = match[2];

      if (specialMention) {
        // Mention spéciale (@everyone ou @here)
        elements.push(
          <MentionBadge
            key={`mention-${match.index}`}
            type={specialMention as 'everyone' | 'here'}
            onClick={() => {
              // Gérer le clic sur mention spéciale
              console.log(`Mention ${specialMention} cliquée`);
            }}
          />
        );
      } else if (userId) {
        // Mention d'utilisateur
        const member = members.find(m => m.user?.id === userId || m.id === userId);
        if (member) {
          const isOwner = server?.ownerId === member.user?.id;
          const roleColor = member.roles?.[0]?.color || '#B5BAC1';
          
          elements.push(
            <MentionBadge
              key={`mention-${match.index}`}
              type="user"
              userId={userId}
              username={member.user?.pseudo || member.pseudo}
              roleColor={roleColor}
              isOwner={isOwner}
              onClick={() => {
                // Gérer le clic sur mention utilisateur
                console.log(`Utilisateur ${member.user?.pseudo} cliqué`);
              }}
            />
          );
        } else {
          // Utilisateur non trouvé, afficher en texte brut
          elements.push(
            <span key={`text-${match.index}`} style={{ color: '#ED4245' }}>
              {fullMatch}
            </span>
          );
        }
      }

      lastIndex = match.index + fullMatch.length;
    }

    // Ajouter le reste du texte
    if (lastIndex < content.length) {
      elements.push(
        <span key={`text-${lastIndex}`}>
          {content.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  return { parseMentions };
};
