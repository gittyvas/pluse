// frontend/src/components/SparkleButton.jsx
import React from 'react';
import { Button } from './ui/button'; // Assuming shadcn button
function SparkleButton({ children, ...props }) {
  return (<Button {...props} className="bg-purple-500 hover:bg-purple-600 text-white">{children} ✨</Button>);
}
export default SparkleButton;
