import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

const PurchaseOrder = () => {
    return (
      <>
        <Breadcrumb pageName="Purchase Order" />

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
          <button
            
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-900"
          >
            Go to Dashboard
          </button>
        </div>
      </section>
  
      </>
    );
  };
  
  export default PurchaseOrder;