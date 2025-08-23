import React from 'react';
import style from './loadingAnimation.module.css';

const LoadingAnimation: React.FC = () => {
  return (
    <div className={style.loadingContainer}>
      <div className={`${style.dot} ${style.dot1}`}></div>
      <div className={`${style.dot} ${style.dot2}`}></div>
      <div className={`${style.dot} ${style.dot3}`}></div>
    </div>
  );
};

export default LoadingAnimation;