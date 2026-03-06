'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { LinkParser } from '@/components/ui/link-parser';
import { MentionBadge, useMentionParser } from '@/components/ui/mention-badge';

interface MessageContentProps {
  content: string;
  members?: any[];
  server?: any;
  onViewProfile?: (user: any, e?: React.MouseEvent) => void;
  className?: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({
  content,
  members = [],
  server,
  onViewProfile,
  className
}) => {
  const { parseMentions } = useMentionParser();

  // Vérifier si le contenu contient des éléments markdown
  const hasMarkdown = (
    content.includes('**') || 
    content.includes('__') || 
    content.includes('*') || 
    content.includes('_') || 
    content.includes('`') || 
    content.includes('#') || 
    content.includes('>') || 
    content.includes('- ') || 
    content.includes('1. ') ||
    (content.includes('[') && content.includes(']('))
  );

  // Parser les mentions en premier
  const parseContentWithMentionsAndMarkdown = () => {
    const mentionElements = parseMentions(content, members, server);
    
    // Si on a des mentions, les retourner directement (pas de markdown avec mentions pour éviter les conflits)
    if (mentionElements.length > 0) {
      return mentionElements.map((element, index) => {
        if (React.isValidElement(element)) {
          const props = element.props as any;
          const handleClick = () => {
            if (props.type === 'user' && props.userId && onViewProfile) {
              const member = members.find(m => 
                m.user?.id === props.userId || m.id === props.userId
              );
              if (member) {
                onViewProfile(member.user || member);
              }
            }
          };
          
          return React.cloneElement(element as React.ReactElement<any>, {
            key: `mention-${index}`,
            onClick: handleClick
          });
        }
        return element;
      });
    }

    // Si pas de mentions mais markdown, utiliser ReactMarkdown
    if (hasMarkdown) {
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            a: ({ href, children, ...props }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5865F2] hover:underline"
                {...props}
              >
                {children}
              </a>
            ),
            code: ({ className, children, ...props }) => {
              const isInline = !className?.includes('language-');
              return (
                <code
                  className={`${
                    isInline 
                      ? 'bg-[#2F3136] px-1 py-0.5 rounded text-[#B9BBBE] font-mono text-sm' 
                      : 'bg-[#2F3136] p-2 rounded block text-[#B9BBBE] font-mono text-sm overflow-x-auto'
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre: ({ children, ...props }) => (
              <pre
                className="bg-[#2F3136] p-3 rounded-lg overflow-x-auto border border-white/10 my-2"
                {...props}
              >
                {children}
              </pre>
            ),
            blockquote: ({ children, ...props }) => (
              <blockquote
                className="border-l-2 border-[#4F545C] pl-4 py-2 my-2 text-[#B9BBBE] italic"
                {...props}
              >
                {children}
              </blockquote>
            ),
            ul: ({ children, ...props }) => (
              <ul className="list-disc list-inside my-2 text-[#DCDDDE]" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="list-decimal list-inside my-2 text-[#DCDDDE]" {...props}>
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li className="my-1" {...props}>
                {children}
              </li>
            ),
            h1: ({ children, ...props }) => (
              <h1 className="text-xl font-bold text-white mb-2 mt-4" {...props}>
                {children}
              </h1>
            ),
            h2: ({ children, ...props }) => (
              <h2 className="text-lg font-bold text-white mb-2 mt-3" {...props}>
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 className="text-base font-bold text-white mb-1 mt-2" {...props}>
                {children}
              </h3>
            ),
            strong: ({ children, ...props }) => (
              <strong className="font-bold text-white" {...props}>
                {children}
              </strong>
            ),
            em: ({ children, ...props }) => (
              <em className="italic text-[#DCDDDE]" {...props}>
                {children}
              </em>
            ),
            p: ({ children, ...props }) => (
              <p className="mb-2" {...props}>
                {children}
              </p>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      );
    }

    // Si ni mentions ni markdown, parser les liens
    return <LinkParser content={content} />;
  };

  return (
    <div className={className}>
      {parseContentWithMentionsAndMarkdown()}
    </div>
  );
};
