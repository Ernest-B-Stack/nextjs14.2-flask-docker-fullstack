import UserInterface from './components/UserInterface';

export default function Home() {
  return (
    <main className="p-8 max-w-2xl mx-auto min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
      {/* Passing "flask" as a prop cleanly fixes the TypeScript compilation error */}
      <UserInterface backendName="flask" />
    </main>
  );
}