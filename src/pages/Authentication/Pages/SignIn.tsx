import FotoSanoh from '../../../images/cover/foto-sanoh-2.png';
import Logo from '../../../images/logo-sanoh.png'
import PasswordInput from '../../../components/PasswordInput';
import { API_Login } from '../../../api/api';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { toast, ToastContainer } from 'react-toastify';

const SignIn: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Melakukan request ke endpoint login API
      const response = await axios.post(API_Login(), {
        username,
        password,
      });
      const { access_token, role, bp_code, name } = response.data;
      // toast.success('Login berhasil!');
      
      // Simpan token ke localStorage
      localStorage.setItem('name', name);
      localStorage.setItem('bp_code', bp_code);

      switch (role) {
        case '1':
          localStorage.setItem("role", "supplier");          
          break;
        case '3':
          localStorage.setItem("role", "purchasing");
          break;
        case '2':
          localStorage.setItem("role", "warehouse");          
          break;
        case '6':
          localStorage.setItem("role", "admin_subcont");          
          break;
        case '4':
          localStorage.setItem("role", "admin");          
          break;
        case '5':
          localStorage.setItem("role", "subcont");          
          break;
        default:
          toast.error('Role not found!');
          break;
      }

      login(role, access_token);
      navigate('/dashboard');
    } catch (error) {
      // Error handling jika terjadi kesalahan saat login
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="">
        <section className="flex h-screen w-screen overflow-y-auto flex-col p-5 bg-white max-md:pr-12 max-sm:flex max-sm:flex-col max-sm:mx-5 max-sm:mt-5">
          <div className="flex gap-5 max-md:flex-col my-auto mx-auto">
            <div className="flex flex-col ml-auto w-6/12 max-md:ml-0 max-md:w-full">
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
                    />
                  </div>

                  <div className="flex flex-col mb-5 mt-3">
                    <PasswordInput password={password} setPassword={setPassword} />
                  </div>

                  <button
                    id="login-button"
                    type="submit"
                    className="gap-2 self-stretch px-5 py-3 mt-7 text-base text-white whitespace-nowrap rounded-lg bg-blue-900 min-h-[48px] hover:bg-blue-950 focus:ring-4 focus:ring-blue-300"
                    disabled={loading}
                  >
                    {loading ? (
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
                      'Login'
                    )}
                  </button>
                </form>
                <p className="self-center mt-9 text-xs font-medium text-center text-slate-800 w-[259px] max-md:mt-10 max-sm:self-center">
                  <span className="text-zinc-400">By logging in, I accept the company&apos;s</span>
                  <br />
                  <span>Terms of Use & Privacy Policy.</span>
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
