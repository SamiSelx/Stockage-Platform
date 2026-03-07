export default function NotFoundPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black-500">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl mb-8">Page Not Found</p>
      <a href="/" className="text-blue-500 hover:underline">
        Go back to Home
      </a>
    </div>
  );
}
