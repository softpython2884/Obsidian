'use client';

import React from 'react';
import { LinkDetector, ParsedLink } from '@/lib/link-detector';
import { LinkEmbed } from './link-embed';
import { cn } from '@/lib/utils';

interface LinkParserProps {
  content: string;
  className?: string;
  maxEmbeds?: number;
  embedThreshold?: number;
}

interface ParsedSegment {
  type: 'text' | 'link';
  content: string;
  link?: ParsedLink;
}

export const LinkParser: React.FC<LinkParserProps> = ({ 
  content, 
  className, 
  maxEmbeds = 3,
  embedThreshold = 50 
}) => {
  // Parse le contenu pour extraire les liens
  const parseContent = (): ParsedSegment[] => {
    const segments: ParsedSegment[] = [];
    const links = LinkDetector.extractLinks(content);
    
    if (links.length === 0) {
      return [{ type: 'text', content }];
    }

    let lastIndex = 0;
    const sortedLinks = links.sort((a, b) => content.indexOf(a) - content.indexOf(b));

    sortedLinks.forEach(link => {
      const index = content.indexOf(link, lastIndex);
      
      // Ajouter le texte avant le lien
      if (index > lastIndex) {
        const textBefore = content.substring(lastIndex, index);
        if (textBefore) {
          segments.push({ type: 'text', content: textBefore });
        }
      }
      
      // Ajouter le lien
      const parsedLink = LinkDetector.parseLink(link);
      segments.push({ 
        type: 'link', 
        content: link,
        link: parsedLink 
      });
      
      lastIndex = index + link.length;
    });

    // Ajouter le texte restant
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      if (remainingText) {
        segments.push({ type: 'text', content: remainingText });
      }
    }

    return segments;
  };

  const segments = parseContent();
  const embeddableLinks = segments
    .filter(s => s.type === 'link' && LinkDetector.shouldEmbed(s.content))
    .slice(0, maxEmbeds);

  // Déterminer si on doit afficher les embeds
  const shouldShowEmbeds = content.length >= embedThreshold || embeddableLinks.length > 0;

  return (
    <div className={cn("link-parser", className)}>
      {/* Afficher les embeds séparément au-dessus du texte */}
      {shouldShowEmbeds && embeddableLinks.length > 0 && (
        <div className="space-y-3 mb-3">
          {embeddableLinks.map((segment, index) => (
            <LinkEmbed
              key={`embed-${index}-${segment.content}`}
              url={segment.content}
              className="block"
            />
          ))}
        </div>
      )}

      {/* Afficher le contenu textuel avec les liens cliquables */}
      <div className="text-[#DBDEE1] text-[15px] leading-relaxed break-words">
        {segments.map((segment, index) => {
          if (segment.type === 'text') {
            return <span key={`text-${index}`}>{segment.content}</span>;
          }

          if (segment.type === 'link' && segment.link) {
            // Si le lien a déjà un embed, l'afficher en mode compact
            const hasEmbed = embeddableLinks.some(e => e.content === segment.content);
            
            return (
              <a
                key={`link-${index}`}
                href={segment.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5865F2] hover:text-[#4752C4] transition-colors inline-flex items-center space-x-1"
              >
                <span className="underline">
                  {hasEmbed ? segment.link.displayUrl : segment.content}
                </span>
              </a>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

/**
 * Composant pour afficher uniquement les embeds (utilisé pour les messages courts)
 */
export const LinkEmbedsOnly: React.FC<{ content: string; className?: string }> = ({ 
  content, 
  className 
}) => {
  const links = LinkDetector.extractLinks(content);
  const embeddableLinks = links
    .filter(LinkDetector.shouldEmbed)
    .slice(0, 3); // Maximum 3 embeds

  if (embeddableLinks.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3 mt-2", className)}>
      {embeddableLinks.map((link, index) => (
        <LinkEmbed
          key={`embed-${index}-${link}`}
          url={link}
          className="block"
        />
      ))}
    </div>
  );
};

/**
 * Hook pour vérifier si un contenu contient des liens
 */
export const useHasLinks = (content: string): boolean => {
  return LinkDetector.extractLinks(content).length > 0;
};

/**
 * Hook pour compter le nombre de liens dans un contenu
 */
export const useLinkCount = (content: string): number => {
  return LinkDetector.extractLinks(content).length;
};
