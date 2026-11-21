import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as authService from '../../services/auth.service'
import resetIcon from "../../assets/imgTwo.svg"
import { AxiosError } from 'axios'
import BeatLoader from "react-spinners/BeatLoader";
import Header from '../../components/Header';
// import resetImage from "../../assets/resetImage.svg"
import traitText from "../../assets/traitstext.svg"
import imgReset from "../../assets/imgReset.png"

interface ForgotPasswordProps {
  fromAdmin?: boolean
}

export default function ForgotPassword({fromAdmin = false}: ForgotPasswordProps) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // A locked sign in sends people here with their email filled in.
  const [email, setEmail] = useState(params.get('email') || '')
  const lockedOut = params.get('reason') === 'locked'
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const value = email.trim()
    if (!value) {
      setError("Enter the email you signed up with.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("That email address does not look right. Check it and try again.")
      return
    }
    setIsLoading(true)

    try {
      fromAdmin ? await authService.adminForgotPasswordRequest(email) :
      await authService.forgotPasswordRequest(email);
      
      setSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof AxiosError
          ? err.response?.data?.message
          : "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const gotToLogin = () => {
    navigate("/login")
  }

  return (
<div className="relative min-h-screen w-full bg-gradient-to-br from-[#CCE0F5] via-[#e9eff7] to-white md:bg-none md:bg-white">
      <Header />

      {
        success ? (
          <div className='flex flex-col items-center bg-transparent p-[20px] md:p-[20px] p-[10px] gap-y-[20px] mt-10'>
            <div className=''>
              <img src={resetIcon} />
            </div>
            <p className='text-[#4C4E53] text-center max-w-[450px] px-4'>We've sent an email to <span className='text-[#101828]'>{email}</span> with a link to get back into your account.</p>
          </div>
        ) : (
        <div className='flex bg-transparent p-[20px] md:p-[20px] p-[10px] w-full'>
          <div className="w-full md:w-[50%] min-h-[300px] md:min-h-[500px] flex flex-col justify-center items-center gap-y-[30px] p-4 md:p-0">
            <div className="w-full max-w-[450px]">
              <h2 className="text-xl font-semibold text-[#101828] text-center md:text-left">
                Forget your password?
              </h2>
              <p className="text-[14px] text-[#757575] font-medium text-center md:text-left">
                Enter the email you used to register with Aligntraits
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6 flex flex-col w-full max-w-[450px]">
              {lockedOut && (
                <p role="status" className="rounded-lg border border-[#FEDF89] bg-[#FFFAEB] px-3 py-2 text-[14px] text-[#93370D]">
                  Too many wrong passwords. Sign in is paused for up to an hour. Set a new password below to sign in now.
                </p>
              )}
              <div className="">
                <input
                  id="email"
                  type="email"
                  placeholder='Please enter your email'
                  required
                  className="mt-1 w-full h-12 px-4 py-3 border-[1px] border-[#ccc] rounded-xl bg-white shadow-md focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setError(null)}
                />
                {error && (
                  <p className="text-[#E33629] text-[12px] mt-1">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 py-2 px-4 bg-[#004085] hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
              >
                {isLoading ? <BeatLoader /> : "Reset Password"}
              </button>

              <p className='text-center text-[#101828] text-[12px] font-semibold'>Remember password? <span onClick={gotToLogin} className='text-[#004085] cursor-pointer'>Login</span></p>
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
        )
      }
    </div>
  );
} 