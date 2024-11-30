import Hero from './_components/Hero';

export default function Home() {
  return (
    <div className="flex w-screen flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-gradient-to-r from-white via-blue-500 to-purple-600 text-white">
      <Hero />
    </div>
  );
}
