import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { SignUpCredentials } from "../../types/auth.types";
import { AiOutlineEye, AiOutlineEyeInvisible, } from "react-icons/ai";
import { FcGoogle, } from "react-icons/fc";
// import { FiMail, FiArrowLeft } from "react-icons/fi";
// import Done from '../../assets/Done 1.png';
import imgReset from "../../assets/imgReset.png"
import traitText from "../../assets/traitstext.svg"
import BeatLoader from "react-spinners/BeatLoader";
import Header from '../../components/Header';
import { GOOGLE_AUTH_URL } from '../../constants/auth.constant'
import { removeToken } from "../../services/auth.service";
import PasswordChecker from '../../components/PasswordChecker'
import { rememberJoinParams } from "../../services/pendingJoin";

export default function Register() {
  // Remember an ambassador's or a school's link until the student is signed in.
  useEffect(() => {
    rememberJoinParams(window.location.search);
  }, []);
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<SignUpCredentials>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const [counter, setCounter] = useState(119); // 1:59 = 119 seconds
  const [disabled, setDisabled] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false)

  const [rules, setRules] = useState({
    length: false,
    lower: false,
    upper: false,
    number: false,
    special: false,
  })

  useEffect(() => {
    setRules({
      length: credentials.password.length >= 8,
      lower: /[a-z]/.test(credentials.password),
      upper: /[A-Z]/.test(credentials.password),
      number: /[0-9]/.test(credentials.password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(credentials.password),
    })
  }, [credentials.password])

  const validCount = [rules.lower, rules.upper, rules.number, rules.special].filter(Boolean).length


  // const openMail = ()=> {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (disabled && counter > 0) {
      timer = setInterval(() => {
        setCounter((prev) => prev - 1);
      }, 1000);
    } else if (counter === 0) {
      setDisabled(false);
    }
    return () => clearInterval(timer);
  }, [counter, disabled]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')} seconds`;
  };

  const handleResend = () => {
    // Simulate resend action
    console.log('OTP resent');
    setCounter(119);
    setDisabled(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(
        credentials.firstname,
        credentials.lastname,
        credentials.email,
        credentials.password
      );
      setSuccess(true); // Update success state
      setDisabled(true);
      // navigate("/dashboard"); // Redirect to dashboard
    } catch (err) {
      console.error("Registration failed:", err);
      setSuccess(false); // Ensure success state is reset
    }
  };

  const isFormValid = () => {
    return (
      credentials.email.trim() !== "" &&
      credentials.password.trim() !== "" &&
      agreed &&
      validCount >= 3 && rules.length
    );
  };

  const handleClick = () => {
    navigate("/terms-and-conditions");
  };

  useEffect(() => {
removeToken()
  }, [])


  return (
<div className="relative min-h-screen w-full bg-gradient-to-br from-[#CCE0F5] via-[#e9eff7] to-white md:bg-none md:bg-white">
      <Header />
      {success ? (
        <div className="flex p-[20px] md:p-[20px] p-[10px]">
          <div className="w-full md:w-[50%] flex flex-col gap-y-[10px] justify-center items-center p-4 md:p-0">
            <p className="w-full max-w-[450px] text-[#1F2228] text-[25px] font-semibold">Verify Your Email Address</p>
            <p className="w-full max-w-[450px] text-[#4C4E53] text-[14px]">
              A verification mail has been sent to 
              <span className="text-[#101828] font-semibold"> {credentials.email}</span>. <br />Please click on the link to verify your account.
            </p>

            <div className="flex flex-col items-center space-y-2">
              <button
                disabled={disabled}
                onClick={handleResend}
                className={`px-4 py-2 rounded-lg text-white text-sm font-semibold ${
                  disabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#004085] hover:bg-blue-700'
                }`}
              >
                Resend OTP
              </button>
              {/* {disabled && ( */}
                <p className="text-sm italic text-gray-600">{formatTime(counter)}</p>
              {/* )} */}
            </div>
          </div>

          {/* Right side component - hidden on mobile */}
          <div className='hidden md:flex w-[50%] justify-center'>
            <div className='w-[100%] size-max bg-[#004085] rounded-xl flex flex-col gap-y-[15px] p-[30px] items-start'>
              <img src={traitText} alt='text' className='h-[25px] ml-[-10px]' />

              <p className='text-[20px] text-[white] font-semibold'>The simplest way to navigate your educational future</p>

              <p className='text-[white] text-[12px]'>Enter your credentials to access your account</p>

              <img src={imgReset} alt='reset Image' className='h-[350px] w-[100%]' />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-x-[30px] md:gap-x-[30px] gap-x-0 p-[20px] md:p-[20px] p-[10px]">
          <div className="w-full md:w-[50%] space-y-4 p-4 md:p-8 flex flex-col items-center">
            <div className="flex flex-col justify-center w-full max-w-[450px]">
              <h2 className="text-xl font-bold">
                Get started now
              </h2>
              <p className='text-[#757575] text-[12px] font-medium'>Enter your credentials to access your account</p>
            </div>

            <div className="mt-4 w-full max-w-[450px]">
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => window.location.href = GOOGLE_AUTH_URL}
                  className="w-full h-12 flex justify-center items-center gap-x-[10px] px-2 py-1 rounded-xl border border-[#ccc] shadow-lg hover:bg-gray-50"
                >
                  <FcGoogle className="text-4xl" />
                  <p className="text-sm md:text-base">Sign up with Google</p>
                </button>
              </div>
            </div>

            <div className="relative w-full max-w-[450px]">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or
                </span>
              </div>
            </div>

            {error && (
              <p className="text-[#E33629] text-[12px] mt-1">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-[450px]">
              <div>
                <label htmlFor="email" className="block text-[16px] font-[600]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-1 w-full h-12 px-4 py-3 border-[1px] border-[#ccc] rounded-xl bg-white shadow-md focus:outline-none"
                  placeholder="Enter your email address"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-[16px] font-[600]"
                >
                  Password
                </label>
                <div className="relative w-full">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="mt-1 w-full h-12 px-4 py-3 border-[1px] border-[#ccc] rounded-xl bg-white shadow-md focus:outline-none"
                    placeholder="Enter your Password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                    onFocus={() => {
                    setShowPasswordRules(true)
                  }}
                  onBlur={() => setShowPasswordRules(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[#004085]"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible size={20} />
                    ) : (
                      <AiOutlineEye size={20} />
                    )}
                  </button>
                </div>
                {showPasswordRules  && <PasswordChecker password={credentials.password} />}
              </div>

              <label className="w-full inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={() => setAgreed(!agreed)}
                  className="form-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-800">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={handleClick}
                    className="underline font-medium text-gray-900 hover:text-gray-700"
                  >
                    Terms & Privacy
                  </button>
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className="w-full h-12 flex justify-center items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
              >
                {isLoading ? <BeatLoader /> : "Sign Up"}
              </button>

              <div className="text-center w-full">
                <span className="text-[16px] font-[400] ">
                  Have an account?{" "}
                </span>
                <button
                  onClick={() => navigate("/login")}
                  className="text-[16px] text-[#004085] font-[700] underline"
                >
                  Login
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
      )}
    </div>
  );
  
}
