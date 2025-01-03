import { useNavigate } from "react-router-dom";
import Button from "../../../components/Forms/Button";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/');
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
            Sorry, you don't have permission to access this menu.
          </p>
          <div className="flex justify-center">
            <Button
              title="Go to Dashboard"
              onClick={handleRedirect}
            />
          </div>
        </div>
      </section>
    </>
  );
};
  
export default Unauthorized;
  