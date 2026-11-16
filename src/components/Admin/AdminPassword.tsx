import { useState, useEffect } from "react";
import { BeatLoader } from "react-spinners";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAuth } from "../../contexts/useAuth";
import { toast } from "react-toastify";
import { logout, updatePassword } from "../../services/auth.service";

interface ErrorObjType {
  currentPassword: boolean;
  newPassword: boolean;
  confirmPassword: boolean;
}

const AdminPassword = () => {
  const {token}  = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [email, setEmail] = useState("");

  useEffect(() => {
    const admin = localStorage.getItem("admin")
    const adminData = admin ? JSON.parse(admin) : null;
  
    if (adminData) {
      setEmail(adminData.email);
    }
  }, [])
  


  // Cancel clears what was typed.
  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  const [errorObj, setErrorObj] = useState<ErrorObjType>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });



  const checkAllFields = () => {
    if (currentPassword.length === 0) {
      setErrorObj((prev) => ({ ...prev, currentPassword: true }));
    } 

    if (confirmPassword.length === 0) {
      setErrorObj((prev) => ({ ...prev, confirmPassword: true }));
    }

    if (newPassword.length === 0) {
      setErrorObj((prev) => ({ ...prev, newPassword: true }));
    } 
  }

  const isFormValid = () => {
    if (currentPassword.length > 0 && confirmPassword.length > 0 && newPassword.length > 0) {
      return true;
    }
    return false;
  }

    const handleSubmit = async () => {
  
      checkAllFields()
  
      if (!isFormValid()) {
        toast.error("Please fill all input fields!");
        return 
      }
      
      if (newPassword !== confirmPassword) {
        toast.error("New Password and Confirm Password must be the same!")
        return
      }

      const payload = {
        email,
        currentPassword,
        newPassword,
        confirmPassword
      }

      try {
        setIsLoading(true)
        let response:any;
        if (token) {
          response = await updatePassword(JSON.stringify(payload), token);
        } else {
          toast.error("Authentication token is missing!");
          return;
        }
  
        console.log("response: ", response) 
  
        if (response.status === 200) {
          toast.success("User details updated successfully!");
          toast.success("Logging you out!")
          setTimeout(() => {
            logout()
            window.location.href = "/admin/login";
          }, 2000)
        }
      } catch (error) {
        console.log("error error: ", error)
      }
      finally {
        setIsLoading(false)
      }
    }


  return (
    <div className="w-full min-w-0 bg-[#FAFAFA] border-[1px] border-[#E0E0E0] rounded-lg flex flex-col justify-between gap-6 p-5">
      <div>
        <p className="text-[#101828] text-[20px] font-semibold">Password</p>
        <p className="text-[#737373] text-[14px] font-normal">Change the password you use to sign in.</p>
      </div>

      <div className="flex flex-col gap-y-[10px] w-full relative">
        <p className={`text-[16px] font-medium  ${errorObj.currentPassword ? "text-[#F04438]" : "text-[#1E1E1E]"}`}>Current Password*</p>
        <input
          type={showCurrentPassword ? "text" : "password"}
          name="currentPassword"
          onFocus={() => setErrorObj((prev) => ({...prev, currentPassword: false}))}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="border-[1px] px-[10px] rounded-md border-[#E9E9E9] py-2 focus:outline-none w-full text-[16px] font-[400] text-[black]"
        />
        <button
          type="button"
          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          className="absolute right-1 top-[55px] flex h-11 w-11 -translate-y-1/2 items-center justify-center"
        >
          {showCurrentPassword ? (
            <AiOutlineEyeInvisible size={20} />
          ) : (
            <AiOutlineEye size={20} />
          )}
        </button>
      </div>


      <div className="flex flex-col gap-y-[10px] w-full relative">
        <p className={`text-[16px] font-medium  ${errorObj.newPassword ? "text-[#F04438]" : "text-[#1E1E1E]"}`}>New Password*</p>
        <input
          type={showPassword ? "text" : "password"}
          name="newPassword"
          value={newPassword}
          onFocus={() => setErrorObj((prev) => ({...prev, newPassword: false}))}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border-[1px] px-[10px] rounded-md border-[#E9E9E9] py-2 focus:outline-none w-full text-[16px] font-[400] text-[black]"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-1 top-[55px] flex h-11 w-11 -translate-y-1/2 items-center justify-center"
        >
          {showPassword ? (
            <AiOutlineEyeInvisible size={20} />
          ) : (
            <AiOutlineEye size={20} />
          )}
        </button>
      </div>


      <div className="flex flex-col gap-y-[10px] w-full relative">
        <p className={`text-[16px] font-medium  ${errorObj.confirmPassword ? "text-[#F04438]" : "text-[#1E1E1E]"}`}>Confirm Password*</p>
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          value={confirmPassword}
          onFocus={() => setErrorObj((prev) => ({...prev, confirmPassword: false}))}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-[1px] px-[10px] rounded-md border-[#E9E9E9] py-2 focus:outline-none w-full text-[16px] font-[400] text-[black]"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-1 top-[55px] flex h-11 w-11 -translate-y-1/2 items-center justify-center"
        >
          {showConfirmPassword ? (
            <AiOutlineEyeInvisible size={20} />
          ) : (
            <AiOutlineEye size={20} />
          )}
        </button>
        <p className="text-[#737373] text-[12px] font-normal">Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.</p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-x-[20px] mt-[20px] w-full sm:justify-end">
        <button type="button" onClick={handleCancel} className="rounded-lg w-full sm:w-[150px] h-[44px] sm:h-[40px] border-[1px] border-[#DDDDDD] text-[14px] text-[#1E1E1E] semi-bold cursor-pointer">Cancel</button>

        <button type="button" onClick={handleSubmit} className="rounded-lg w-full sm:w-[150px] h-[44px] sm:h-[40px] bg-[#004085] text-[14px] text-[white] semi-bold cursor-pointer">
          {isLoading ? <BeatLoader /> : "Save Changes"}
        </button>

      </div>
    </div>  
  )
}

export default AdminPassword