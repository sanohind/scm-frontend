import FotoSanoh from '../../../images/cover/foto-sanoh-2.png';
import Logo from '../../../images/logo-sanoh.png'
import PasswordInput from '../../../components/PasswordInput';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ToastContainer } from 'react-toastify';

const SignIn: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="">
        <section className="flex h-screen w-screen overflow-y-auto flex-col p-5 bg-white max-md:pr-12 max-sm:flex max-sm:flex-col max-sm:mx-5 max-sm:mt-5">
          <div className="flex gap-5 max-md:flex-col my-auto mx-auto">
            <div className="flex-col ml-auto w-6/12 max-md:ml-0 max-md:w-full hidden md:flex">
              <img
                loading="lazy"
                src={FotoSanoh}
                alt="Login illustration"
                className="object-contain grow w-full h-auto aspect-[0.71] max-w-[710px] max-md:mt-10 max-md:max-w-[286px] max-sm:self-stretch max-sm:m-auto max-sm:w-full max-sm:max-w-[296px]"
              />
            </div>
            <div className="flex flex-col ml-5 w-6/12 max-md:ml-0 max-md:w-full my-auto">
              <div className="flex flex-col mr-auto w-full max-w-[500px] max-md:mt-10 max-md:ml-0 max-sm:mt-5 max-sm:ml-auto max-sm:max-w-[301px]">
                <img
                  loading="lazy"
                  src={Logo}
                  alt="Company logo"
                  className="object-contain max-w-full aspect-[2.79] w-[120px] max-md:ml-1"
                />
                <form className="flex flex-col mt-6 w-full" onSubmit={onSubmit} autoComplete="off">
                  <div className="flex flex-col">
                    <label htmlFor="username" className="text-base text-slate-800 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      autoFocus
                      placeholder="Enter Username"
                      className="px-4 py-3.5 w-full bg-white rounded-lg border border-solid border-indigo-600 border-opacity-40 min-h-[48px] shadow-[0px_4px_8px_rgba(70,95,241,0.1)] text-sm text-zinc-400"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col mb-5 mt-3">
                    <PasswordInput password={password} setPassword={setPassword} isRequired />
                  </div>

                  <button
                    id="login-button"
                    type="submit"
                    className="gap-2 self-stretch px-5 py-3 mt-7 text-base text-white whitespace-nowrap rounded-lg bg-blue-900 min-h-[48px] hover:bg-blue-950 focus:ring-4 focus:ring-blue-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          aria-hidden="true"
                          role="status"
                          className="inline w-4 h-4 me-3 text-white animate-spin"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="#E5E7EB"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentColor"
                          />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
                <p className="self-center mt-9 text-xs font-medium text-center text-slate-800 w-[259px] max-md:mt-10 max-sm:self-center">
                  <span className="text-zinc-400">By Signing in, I accept the company&apos;s</span>
                  <br />
                    <button
                    onClick={() => {
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
                      
                      // Handle click outside to close
                      modal.addEventListener('click', (e) => {
                      if (e.target === modal) {
                        modal.remove();
                      }
                      });

                      modal.innerHTML = `
                      <div class="bg-white p-8 rounded-lg relative max-w-2xl">
                        <button class="absolute top-2 right-2 text-gray-600 hover:text-gray-800" onclick="this.parentElement.parentElement.remove()">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        </button>
                        <h2 class="text-xl font-bold mb-4">Terms of Use & Privacy Policy</h2>
                        <div class="text-gray-700">
                        <h3 class="font-semibold mb-2">Terms of Use</h3>
                        <p class="mb-4">By using our service, you agree to follow all applicable laws and regulations. You are responsible for maintaining the confidentiality of your account.</p>
                        <h3 class="font-semibold mb-2">Privacy Policy</h3>
                        <p>We collect and process your personal information in accordance with our privacy policy. Your data is protected and will only be used for service-related purposes.</p>
                        </div>
                      </div>
                      `;
                      document.body.appendChild(modal);
                    }}
                    className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                    Terms of Use & Privacy Policy
                    </button>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SignIn;
