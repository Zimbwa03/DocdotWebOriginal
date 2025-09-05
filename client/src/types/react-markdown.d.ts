declare module 'react-markdown' {
  import { ComponentType } from 'react';
  
  interface ReactMarkdownProps {
    children: string;
    className?: string;
    components?: {
      [key: string]: ComponentType<any>;
    };
  }
  
  const ReactMarkdown: ComponentType<ReactMarkdownProps>;
  export default ReactMarkdown;
}

