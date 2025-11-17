
import React from 'react';
import { SparklesIcon } from './icons';

const Loader: React.FC = () => {
  const messages = [
    "AI가 붓을 들었습니다...",
    "색상을 조합하고 있어요...",
    "창의력을 발휘하는 중...",
    "거의 다 완성되었어요!",
  ];

  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2500);

    return () => clearInterval(interval);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 text-gray-300">
      <SparklesIcon className="w-12 h-12 text-purple-400 animate-pulse" />
      <h3 className="mt-4 text-lg font-semibold">당신만의 배경화면을 만들고 있어요.</h3>
      <p className="mt-2 text-sm text-gray-400 transition-opacity duration-500">{message}</p>
    </div>
  );
};

export default Loader;
