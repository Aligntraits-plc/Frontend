import React, { useState } from "react";
// import AdminAuth from "../../assets/admin/adminAuth.png";
import Logo from "../../assets/logo.svg";
import LogoTwo from "../../assets/image2.png";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { LoginCredentials, AuthResponse } from "../../types/auth.types";
import { adminLogin, setToken, getAdminDetails } from "../../services/auth.service";
import BeatLoader from "react-spinners/BeatLoader";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { IoIosStar } from "react-icons/io";
import { toast } from "react-toastify";


export default function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = React.useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);
  // const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const [adminError, setAdminError] = useState("")
  const [passwordError, setPasswordError] = useState("")
const { token, setToken: setSessionToken } = useAuth()
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = (await adminLogin(
        credentials.email,
        credentials.password
      )) as AuthResponse;

      if (response.status !== null && response.status === 200) {
        try {
          const admin =  await getAdminDetails(response.token)

          if (admin) {
            setToken(response.token);
            // Also tell the app it is signed in now, so the panel opens without a page refresh.
            setSessionToken(response.token);
            localStorage.setItem('admin', JSON.stringify(admin.data))
            // School counsellors use the school portal; everyone else the admin panel.
            const role = admin.data?.role
            navigate(role === "COUNSELLOR" ? "/school-portal" : role === "CONTENT_MANAGER" || role === "ANALYST" ? "/admin/schools" : "/admin")
          }
        } catch (e:any) {
          toast.error(e.message)
          setAdminError(e.message)
          console.log("e: ", e.message)
        }
  
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        // const errors = err.response.data.errors;

        // console.log("test error: ", err)

        if (err.status === 404) {
          setAdminError("Admin does not exist")
        } else {
          setPasswordError("This password is not correct")
        }

        // errors.forEach((error: { message: string }) => {
        //   if (error.message) {
        //     setError(error.message);
        //   }
        // });
      }

      // if (
      //   err.response &&
      //   err.response.data.message &&
      //   !err.response.data.errors
      // ) {
      //   setError(err.response.data.message);
      // }

      setTimeout(() => {
        setAdminError("")
        setPasswordError("")
      }, 3000);
      throw err;
    } finally {
      setIsLoading(false);
      
    }
  };

  const isFormValid = () => {
    return (
      credentials.email.trim() !== "" && credentials.password.trim() !== ""
    );
  };

  if(token == undefined) {
     return (
    <div className="flex h-screen p-0 m-0 w-full ">
      <div className="w-full h-screen p-5 lg:p-10  md:basis-[50%] space-y-14 relative">
        <div className="flex justify-between  w-full p-0">
          <img src={Logo} alt="" className="p-0 w-40" />
          {/* <h2 className="text-[#999999] text-[14px]">
            Not an admin?{" "}
            <span className="text-[#004085] font-[400]">Create an account</span>
          </h2> */}
        </div>
        <div className="flex flex-col justify-center items-center space-y-7">
          <div className="mx-auto space-y-4">
            <h1 className="text-[30px] md:w-[80%] xl:w-[70%] mx-auto leading-[40px]">
              Access is restricted to authorized personnel only
            </h1>
            <p className="text-[16px] md:w-[80%] xl:w-[70%] mx-auto text-[#737373]">
              By logging in, you agree to uphold strict confidentiality
              regarding all data you access, changes are recorded and traceable.
            </p>
          </div>

          <form
            className="md:w-[80%] xl:w-[70%] space-y-4 lg:space-y-4"
            onSubmit={(e) => handleSubmit(e)}
          >
            <div className="space-y-2">
              <label htmlFor="email" className="text-[14px] text-[#00162F]">
                Email*
              </label>
              <input
                id="email"
                type="email"
                required
                className={`w-full h-[44px] rounded-md focus:outline-none border ${adminError ? "border-[#FDA29B]" : "border-[#D0D5DD]"} px-3 py-2 text-[14px]`}
                placeholder="Email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
              />
              {adminError && (
                <p className="text-[12px] text-red-500 rounded">{adminError}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-[14px] text-[#00162F]">
                Password*
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`w-full h-[44px] rounded-md focus:outline-none border ${passwordError ? "border-[#FDA29B]" : "border-[#D0D5DD]"} px-3 py-2 text-[14px]`}
                  placeholder="Enter your Password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-[12px] text-red-500 rounded">{passwordError}</p>
              )}
            </div>


            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="w-full mx-auto flex justify-center py-2 px-4 bg-[#004085] hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
            >
              {isLoading ? <BeatLoader /> : "LOGIN"}
            </button>
            <p onClick={() => navigate("/admin/forgot-password")} className="text-[#999999] text-[14px] text-center cursor-pointer hover:underline hover:text-blue-600 transition-colors">Forgot password?</p>
          </form>

          <div className="flex justify-between absolute bottom-[20px] xl:w-[90%]">
            <p className="text-[#999999] text-[14px]">© Aligntraits 2025</p>

            <p className="text-[#999999] text-[14px]">© Aligntraits 2025</p>
          </div>
        </div>
      </div>
      <div className="hidden md:flex w-full basis-[50%] bg-[#E6ECF3] flex-col pl-[20px]">
        {/* <img src={AdminAuth} alt="" className="h-screen w-full" /> */}
        <p className="text-[#00162F] font-medium text-[16px] font-medium p-[30px]">
          AlignTraits has revolutionized the way learning and development are structured. 
          Our platform empowers individuals and organizations with tailored educational pathways, 
          fostering growth and career success.
        </p>
        <div className="flex justify-between items-center px-[30px] relative">
          <div>
            <p className="text-[#00162F] text-[16px] font-medium">— Oluwaseun Sokeye</p>
            <p className="text-[#999999] text-[16px] font-medium">Co-Founder, Aligntraits</p>
          </div>

          <div className="flex h-15 w-15 gap-1">
            {[1, 2, 3, 4, 5].map((elem) => <IoIosStar className="text-[#F6C648]" key={elem} />)}
          </div>
        </div>

        <div className="mt-20 absolute right-[0px] bottom-[0px] rounded-tl-lg border-l-[4px] border-t-[4px] border-[#101828]">
          <img src={LogoTwo} alt="" className="w-[620px] h-[450px] rounded-tl-lg " />
        </div>
      </div>
    </div>
  );
  } else {
    return <Navigate to="/admin" />;
  }
 
}
