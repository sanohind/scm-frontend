import { useNavigate } from 'react-router-dom';
import Button from '../components/Forms/Button';
import { useAuth } from './Authentication/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const logout = useAuth

  const handleRedirect = () => {
    navigate('/'); // Mengarahkan ke halaman dashboard
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <>
      <section className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="py-8 px-4 mx-auto max-w-screen-md text-center">
          <h1 className="mb-4 text-7xl font-extrabold text-primary dark:text-primary-500">
            404
          </h1>
          <p className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Something's missing.
          </p>
          <p className="mb-4 text-lg text-gray-500 dark:text-gray-400">
            Sorry, we can't find that page. You'll find lots to explore on the home page.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              title="Go to Dashboard"
              onClick={handleRedirect}
            />
            <Button
              title="Back"
              onClick={() => navigate(-1)}
            />
            <Button
              title="Logout"
              onClick={handleLogout}
              color='bg-danger'
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default NotFound;
