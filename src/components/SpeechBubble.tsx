type SpeechBubbleProps = {
  text: string;
  author: string;
};

export function SpeechBubble({ text, author }: SpeechBubbleProps) {
  return (
    <blockquote className="speech">
      <p className="speech-text">{text}</p>
      <p className="speech-author">{author}</p>
    </blockquote>
  );
}
