import { useEffect, useState } from 'react'
import { rememberJoinParams } from "../../services/pendingJoin";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { LoginCredentials, } from '../../types/auth.types'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { FcGoogle } from 'react-icons/fc'
import Header from '../../components/Header';
import imgReset from "../../assets/imgReset.png"
import traitText from "../../assets/traitstext.svg"
// import {setToken} from '../../services/auth.service'
import BeatLoader from 'react-spinners/BeatLoader'
import { GOOGLE_AUTH_URL } from '../../constants/auth.constant'
import { removeToken } from '../../services/auth.service'
// import { AxiosError } from 'axios'

export default function Login() {
  useEffect(() => {
    rememberJoinParams(window.location.search);
  }, []);
  const { login, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const status = await login(credentials.email, credentials.password);

      if (status === 200) {
        navigate("/dashboard");
      } else if (status === 800) {
        navigate("/onboarding-form")
      } else {
        console.error("Unexpected status:", status);
      }
    } catch (err: any) {
      // Accounts made by the quiz, a check or a payment have no password yet:
      // send them to set one (we email them a 6 digit code there).
      if (err?.response?.data?.code === "PASSWORD_NOT_SET") {
        navigate(`/setup-password?email=${encodeURIComponent(credentials.email.trim())}`);
        return;
      }
      console.error("Login failed:", err);
    }
  };

  const isFormValid = () => {
    return credentials.email.trim() !== '' && credentials.password.trim() !== ''
  }

  useEffect(() => {
    removeToken();
  }, []);

  return (
<div className="relative min-h-screen w-full bg-gradient-to-br from-[#CCE0F5] via-[#e9eff7] to-white md:bg-none md:bg-white">
      <Header />
      <div className='flex p-[20px] md:p-[20px] p-[10px]'>
        <div className="w-full md:w-[50%] space-y-5 p-4 md:p-8 flex flex-col items-center">
          <div className="flex flex-col justify-center w-full max-w-[450px]">
            <h2 className="text-xl font-bold">
              Get started now
            </h2>
            <p className='text-[#757575] text-[12px] font-medium'>Log in to your Aligntraits account</p>
          </div>
          {error && (
            <p className="text-[#E33629] text-[12px] mt-1">
              {error}
            </p>
          )}

          <div className="mt-4 w-full max-w-[450px]">
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => window.location.href = GOOGLE_AUTH_URL}
                className="w-full h-12 flex justify-center items-center gap-x-[10px] px-2 py-1 rounded-xl border border-[#ccc] shadow-lg hover:bg-gray-50"
              >
                <FcGoogle className="text-4xl" />
                <p className="text-sm md:text-base">Log in with Google</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 w-full max-w-[450px]">
            <div>
              <label htmlFor="email" className="block text-[16px] font-[600]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 w-full h-12 px-4 py-3 border-[1px] border-[#ccc] rounded-xl bg-white shadow-md focus:outline-none"
                style={{
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
                }}
                placeholder="Enter your email address"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
              />
            </div>

            <div className='relative w-full'>
              <div className="absolute right-[0px] flex items-center justify-end w-full">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-[#004085] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className='w-full'>
                <label htmlFor="password" className="block text-[16px] font-[600]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="mt-1 w-full h-12 px-4 py-3 rounded-xl bg-white border-[1px] border-[#ccc] shadow-md focus:outline-none"
                    style={{
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
                    }}
                    placeholder="Enter your Password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[#004085] "
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible size={20} />
                    ) : (
                      <AiOutlineEye size={20} />
                    )}
                  </button>
                </div>
                
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="w-full h-12 rounded-xl flex items-center justify-center py-2 px-4 bg-[#004085] hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isLoading ? <BeatLoader   /> : "Login"}
            </button>

            <div className="text-center w-full">
              <span className="text-[16px] font-[400] ">
                Don't have an account?{" "}
              </span>
              <button
                onClick={() => navigate("/signup")}
                className="text-[16px] text-[#004085] font-[700]"
              >
                Sign up here
              </button>
            </div>
          </form>
        </div>

        {/* Right side component - hidden on mobile */}
        <div className='hidden md:flex w-[50%] justify-center'>
          <div className='w-[65%] size-max bg-[#004085] rounded-xl flex flex-col gap-y-[15px] p-[30px] items-start'>
            <img src={traitText} alt='text' className='h-[25px] ml-[-10px]' />

            <p className='text-[20px] text-[white] font-semibold'>The simplest way to navigate your educational future</p>

            <p className='text-[white] text-[12px]'>Enter your credentials to access your account</p>

            <img src={imgReset} alt='reset Image' className='h-[350px] w-[100%]' />
          </div>
        </div>
      </div>
    </div>
  );
} 