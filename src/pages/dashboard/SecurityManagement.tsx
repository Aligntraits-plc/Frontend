import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { AiOutlineEye, AiOutlineEyeInvisible, } from "react-icons/ai";
import { toast } from 'react-toastify';
import { changePassword } from '../../services/auth.service';
import { BeatLoader } from 'react-spinners';

export interface Credentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const timeAgo = (isoDate?: string | null) => {
  if (!isoDate) return "Never";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
};

export default function SkillRoadMap() {
  const {setPageDesc, token, logout, user} = useAuth()

  const [credentials, setCredentials] = useState<Credentials>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })

  useEffect(() => {
    setPageDesc({
      desc: "Welcome",
      title: "Security Management"
    })
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormError("")
    // Each problem gets its own message, shown under the form.
    if (!credentials.currentPassword) return setFormError("Enter your current password.")
    if (credentials.newPassword.length < 8) return setFormError("Your new password needs at least 8 characters.")
    if (credentials.confirmPassword !== credentials.newPassword) return setFormError("The two new passwords do not match.")
    if (credentials.newPassword === credentials.currentPassword) return setFormError("Choose a new password that is different from the current one.")

    handleChangePassword()

  };

    const handleChangePassword = async () => {
      const payload = {
        currentPassword: credentials.currentPassword,
        newPassword: credentials.newPassword,
        confirmPassword: credentials.confirmPassword
      }
      try {
        setIsLoading(true);
        const response = await changePassword(token as string, payload)

        console.log("response: ", response)

        if (response.status === 200) {
          toast("Password changed successfully. Please login again!")
          setTimeout(async() => {
            await logout();
            window.location.href = '/login'
          }, 1500)
        }
      } catch (err: any) {
        setFormError(err?.response?.data?.errors?.[0]?.message || err?.response?.data?.message || "We could not change your password. Try again.")
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="relative">
      <div className="border-[1px] border-[#EAECF0] flex flex-col gap-y-[15px] shadow-md rounded-xl p-5 w-[100%] size-max">
        <div>
          <p className="text-[#212529] text-[18px] font-bold">Security & Password</p>
          <p className='text-[12px] text-[#757575] mt-2'>Update your password and manage account security.</p>
        </div>


        <form onSubmit={handleSubmit} noValidate className="mt-3 lg:mt-10 border-[1px] border-[#EAECF0] flex flex-col gap-y-[20px] shadow-md rounded-xl p-5 w-[100%] size-max">
          <div>
            <p className="text-[#212529] text-[18px] font-bold">Change Password</p>
            <p className='text-[12px] text-[#757575] mt-2'>Update your password to keep your account secure. You'll be logged out after changing your password.</p>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[14px] font-[600]"
            >
              Current Password*
            </label>
            <div className="relative w-[100%]">
              <input
                id="password"
                type={showPassword.currentPassword ? "text" : "password"}
                required
                className="mt-1 w-[100%] h-12 px-4 py-3 border-[1px] border-[#ccc] rounded-2xl bg-white shadow-md focus:outline-none"
                placeholder="Current password"
                value={credentials.currentPassword}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    currentPassword: e.target.value,
                  })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({
                  ...prev,
                  currentPassword: !prev.currentPassword
                }))}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-[#004085]"
              >
                {showPassword.currentPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-[14px] font-[600]"
            >
              New Password*
            </label>
            <div className="relative w-[100%]">
              <input
                id="newPassword"
                type={showPassword.newPassword ? "text" : "password"}
                required
                className="mt-1 w-[100%] h-12 px-4 py-3 border-[1px] border-[#ccc] rounded-2xl bg-white shadow-md focus:outline-none"
                placeholder="New password"
                value={credentials.newPassword}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    newPassword: e.target.value,
                  })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({
                  ...prev,
                  newPassword: !prev.newPassword
                }))}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-[#004085]"
              >
                {showPassword.newPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmpassword"
              className="block text-[14px] font-[600]"
            >
              Confirm Password*
            </label>
            <div className="relative w-[100%]">
              <input
                id="confirmpassword"
                type={showPassword.confirmPassword ? "text" : "password"}
                required
                className="mt-1 w-[100%] h-12 px-4 py-3 border-[1px] border-[#ccc] rounded-2xl bg-white shadow-md focus:outline-none"
                placeholder="Current password"
                value={credentials.confirmPassword}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    confirmPassword: e.target.value,
                  })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({
                  ...prev,
                  confirmPassword: !prev.confirmPassword
                }))}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-[#004085]"
              >
                {showPassword.confirmPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
          </div>

          {formError && (
            <p role="alert" className="text-[14px] text-[#B42318]">{formError}</p>
          )}
          <div className='w-full flex justify-center lg:justify-end'>
            <button type="submit" className='h-[45px] bg-[#004085] rounded-xl text-[white] font-semibold text-[14px] w-[180px] hover:bg-[#0056b3] transition-colors duration-300'>
              {isLoading ? <BeatLoader /> : "Change Password"}
            </button>
          </div>

        </form>

        <div className="mt-10 border-[1px] border-[#EAECF0] flex flex-col gap-y-[15px] shadow-md rounded-xl p-5 w-[100%] h-[200px]">
          <p className="text-[#212529] text-[18px] font-bold">Security Information</p>

          <div className='flex flex-col gap-y-[20px]'>
            <div className='flex justify-between'>
              <p className='text-[14px]'>Last password change</p>
              <p className='text-[14px]'>{timeAgo(user?.passwordChangedAt)}</p>
            </div>

            <div className='flex justify-between'>
              <p className='text-[14px]'>Last login</p>
              <p className='text-[14px]'>{timeAgo(user?.lastLoginAt)}</p>
            </div>

            <div className='flex justify-between'>
              <p className='text-[14px]'>Account created</p>
              <p className='text-[14px]'>{timeAgo(user?.createdAt)}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
