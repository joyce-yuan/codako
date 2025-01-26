import React from "react";

interface PageMessageProps {
  text: string;
  size?: string;
}

const PageMessage: React.FC<PageMessageProps> = ({ text, size }) => {
  return <div className={`page-message ${size}`}>{text}</div>;
};

export default PageMessage;
