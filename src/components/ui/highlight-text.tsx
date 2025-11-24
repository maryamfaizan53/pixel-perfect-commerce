interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
}

export const HighlightText = ({ text, highlight, className = "" }: HighlightTextProps) => {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isHighlight = part.toLowerCase() === highlight.toLowerCase();
        return isHighlight ? (
          <mark key={index} className="bg-accent/40 text-accent-foreground font-semibold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};
