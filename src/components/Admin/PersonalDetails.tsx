import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { toast } from "react-toastify";
import { updateUserDetails } from "../../services/auth.service";
import { useAuth } from "../../contexts/useAuth";

interface ErrorObjType {
  firstName: boolean;
  lastName: boolean;
  phone: boolean;
}

const PersonalDetails = () => {
  const {token}  = useAuth()
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [errorObj, setErrorObj] = useState<ErrorObjType>({
    firstName: false,
    lastName: false,
    phone: false,
  });

  const loadSaved = () => {
    const admin = localStorage.getItem("admin")
    const adminData = admin ? JSON.parse(admin) : null;
  
    if (adminData) {
      setFirstName(adminData.firstname);
      setLastName(adminData.lastname);
      setEmail(adminData.email);
      if (adminData.contactNumber) {
        setPhone(adminData.contactNumber);
      } else {
        setPhone("");
      }
    }
  }

  useEffect(() => {
    loadSaved()
  }, [])


  // Cancel puts back the saved details.
  const handleCancel = () => {
    loadSaved()
    setErrorObj({ firstName: false, lastName: false, phone: false })
  }

  const checkAllFields = () => {
    if (firstName.length === 0) {
      setErrorObj((prev) => ({ ...prev, firstName: true }));
    } 

    if (lastName.length === 0) {
      setErrorObj((prev) => ({ ...prev, lastName: true }));
    }

    if (phone.length === 0) {
      setErrorObj((prev) => ({ ...prev, phone: true }));
    } 
  }

  const isFormValid = () => {
    if (firstName.length > 0 && lastName.length > 0 && phone.length > 0) {
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


    const payload = {
      data: {
        firstname: firstName,
        lastname: lastName,
        contactNumber: phone,
      }
    }

    try {
      setIsLoading(true)
      let response:any;
      if (token) {
        response = await updateUserDetails(JSON.stringify(payload), token);
      } else {
        toast.error("Authentication token is missing!");

        return;
      }

      if (response.status === 200) {
        const admin = localStorage.getItem("admin")
        const adminData = admin ? JSON.parse(admin) : null;
        if (adminData) {
          adminData.firstname = firstName
          adminData.lastname = lastName
          adminData.contactNumber = phone
          localStorage.setItem("admin", JSON.stringify(adminData))
        }
        toast.success("User details updated successfully!");
      } else {
        toast.error("Failed to update user details!");
      }
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
    finally {

      setIsLoading(false)
    }
    
  }


  return (
    <div className="w-full min-h-[370px] bg-[#FAFAFA] border-[1px] border-[#E0E0E0] rounded-lg flex flex-col justify-between gap-6 p-5">
      <div>
        <p className="text-[#101828] text-[20px] font-semibold">Personal details</p>
        <p className="text-[#737373] text-[14px] font-normal">Update your personal information. This information is used to identify you on the platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px] w-full">
        <div className="flex flex-col gap-y-[10px] min-w-0">
          <p className={`text-[16px] font-medium  ${errorObj.firstName ? "text-[#F04438]" : "text-[#1E1E1E]"}`}>First Name*</p>
          <input
            type="text"
            name="firstName"
            onFocus={() => setErrorObj((prev) => ({...prev, firstName: false}))}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border-[1px] px-[10px] rounded-md border-[#E9E9E9] py-2 focus:outline-none w-full text-[16px] font-[400] text-[black]"
          />
        </div>

        <div className="flex flex-col gap-y-[10px] min-w-0">
          <p className={`text-[16px] font-medium  ${errorObj.lastName ? "text-[#F04438]" : "text-[#1E1E1E]"}`}>Last Name*</p>
          <input
            type="text"
            name="lastName"
            onFocus={() => setErrorObj((prev) => ({...prev, lastName: false}))}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border-[1px] px-[10px] rounded-md border-[#E9E9E9] py-2 focus:outline-none w-full text-[16px] font-[400] text-[black]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px] w-full">
        <div className="flex flex-col gap-y-[10px] min-w-0">
          <p className={`text-[16px] font-medium text-[#1E1E1E]`}>Email*</p>
          <input
            type="text"
            name="email"
            value={email}
            disabled
            onChange={(e) => setEmail(e.target.value)}
            className="border-[1px] px-[10px] rounded-md border-[#E9E9E9] py-2 focus:outline-none w-full text-[16px] font-[400] text-[black]"
          />
        </div>

        <div className="flex flex-col gap-y-[10px] min-w-0">
          <p className={`text-[16px] font-medium  ${errorObj.phone ? "text-[#F04438]" : "text-[#1E1E1E]"}`}>Contact Number*</p>
          <input
            type="number"
            name="contactNumber"
            placeholder="e.g. 08012345678"
            value={phone}
            onFocus={() => setErrorObj((prev) => ({...prev, phone: false}))}
            onChange={(e) => setPhone(e.target.value)}
            className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-[1px] px-[10px] rounded-md border-[#E9E9E9] py-2 focus:outline-none w-full text-[16px] font-[400] text-[black]"
          />
        </div>
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

export default PersonalDetails