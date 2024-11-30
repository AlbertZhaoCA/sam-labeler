import React from 'react';
import Link from 'next/link';

export default function Hero() {
  return (
    <>
      <img src="/robust.png" className="w-48 self-start " />
      <h1
        className="mt-8 font-mono text-8xl text-center font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-400 to-blue-100"
        style={{ textShadow: '4px 5px 5px rgba(255, 0, 0, 0.3)' }}
      >
        Welcome to SAM Labeler <span className="text-white">🏷️</span>
      </h1>
      <p
        className="font-mono text-4xl text-center max-w-2xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"
        style={{ textShadow: '2px 2px 2px rgba(255, 0, 0, 0.3)' }}
      >
        Use SAM to label everything you want with ease and precision. Start your
        annotation journey now and here{' '}
        <span className="text-white text-6xl">🎉</span>!
      </p>
      <img
        src="/favicon/android-chrome-192x192.png"
        alt="SAM Labeler"
        className="my-8"
      />
      <Link
        href="label"
        className="px-8 py-4 bg-white text-blue-500 font-bold rounded-lg shadow-2xl hover:bg-gray-200 hover:text-3xl transition-all duration-300"
        style={{ textShadow: '2px 2px 2px rgba(255, 255, 255, 0.1)' }}
      >
        Get Started
      </Link>
    </>
  );
}
