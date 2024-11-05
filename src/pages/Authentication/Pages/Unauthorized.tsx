import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/'); // Mengarahkan ke halaman dashboard
  };
  
  return (
    <>
      <section className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="py-8 px-4 mx-auto max-w-screen-md text-center">
          <h1 className="mb-4 text-7xl font-extrabold text-primary dark:text-primary-500">
            UNAUTHORIZED
          </h1>
          <p className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            The user is not authorized.
          </p>
          <p className="mb-4 text-lg text-gray-500 dark:text-gray-400">
            Sorry, you don't have permission to access this page.
          </p>
          <button
            onClick={handleRedirect}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-900"
          >
            Go to Dashboard
          </button>
        </div>
      </section>
    </>
  );
};
  
export default Unauthorized;
  