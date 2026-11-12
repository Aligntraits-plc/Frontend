import { useState, useEffect, ChangeEvent } from 'react';
import SchoolPicker, { saveSchoolChoice, schoolChoiceProblem, type SchoolChoice } from '../../components/school/SchoolPicker';
// import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import CustomSelect from '../../components/dashboard/CustomSelect';
import SearchSelect from '../../components/dashboard/SearchSelect';
import companyLogo from "../../assets/AlignTraitsFlaire.svg"
import { BeatLoader } from 'react-spinners';
import { toast } from "react-toastify";
import PhoneInput from 'react-phone-input-2';
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { MdOutlineCalendarToday } from "react-icons/md";
import 'react-phone-input-2/lib/style.css';
import countriesData from "../../data/countries_states.json"

import { upDateUserProfile } from '../../services/auth.service';
import { useAuth } from '../../contexts/useAuth';
import EnhancedDatePicker from '../../components/dashboard/EnhancedDatePicker';

const countryStateData: Record<string, string[]> = {
};

countriesData.map((elem:any) => {
  countryStateData[elem.name] = elem.states
})

const OnboardingPage = () => {
  const {token, user} = useAuth()
  // const [token, setTokenNew] = useState("")
  // const navigate = useNavigate()
  const [firstName, setFirstName] = useState("")

  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDefaultState, setSelectedDefaultState] = useState({
    value: "",
    label: ""
  })

  const [isLoading, setIsLoading] = useState(false)
  // Optional: the student's secondary school (a school link from an invitation preselects it).
  const [schoolChoice, setSchoolChoice] = useState<SchoolChoice>({ mode: 'none' })
  const joinSchool = (() => { try { return localStorage.getItem('at_join_school') } catch { return null } })()
  

  const [errorObj, setErrorObj] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    gender: false,
    country: false,
    state: false,
    dob: false
  })

  const [photo, setPhoto] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("")

  useEffect(() => {
    let tempData = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    setEmail(tempData.email)
    // setTokenNew(tempData.token)
  }, [])

  useEffect(() => {
    if (user?.firstname) setFirstName(user.firstname)
    if (user?.lastname) setLastName(user.lastname)
  }, [user])


  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // 2MB in bytes = 2 * 1024 * 1024
    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      // You can throw an error or show a message
      setUploadError("image should not be more than 2MB")
      return;
    }

    setImageFile(file)
    setUploadError("")
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Get the states for the selected country
  const states = selectedCountry ? countryStateData[selectedCountry] || [] : [];

  useEffect(() => {
    if (selectedCountry.length > 0) {
      setSelectedDefaultState({
        value: countryStateData[selectedCountry][0],
        label: countryStateData[selectedCountry][0]
      })
      setSelectedState(countryStateData[selectedCountry][0])
    }
  }, [selectedCountry]) 

  const handleGenderError = () => {
    setErrorObj((prev) => ({...prev, gender: false}))
  }

  const handlePhoneError = () => {
    setErrorObj((prev) => ({...prev, phone: false}))
  }

  const handleDobError = () => {
    setErrorObj((prev) => ({...prev, dob: false}))
  }

  const handleStateError = () => {
    setErrorObj((prev) => ({...prev, state: false}))
  }

  const handleCountryError = () => {
    setErrorObj((prev) => ({...prev, country: false}))
  }

  const checkAllFields = () => {

    if (!startDate) {
      setErrorObj((prev) => ({...prev, dob: true}))
    } 

    if (firstName.length === 0) {
      setErrorObj((prev) => ({...prev, firstName: true}))
    } 

    if (lastName.length === 0) {
      setErrorObj((prev) => ({...prev, lastName: true}))
    }

    if (email.length === 0) {
      setErrorObj((prev) => ({...prev, email: true}))
    } 

    if (phone.length === 0) {
      setErrorObj((prev) => ({...prev, phone: true}))
    }

    if (selectedCountry.length === 0) {
      setErrorObj((prev) => ({...prev, country: true}))
    } 

    if (selectedState.length === 0) {
      setErrorObj((prev) => ({...prev, state: true}))
    }

    if (gender.length === 0) {
      setErrorObj((prev) => ({...prev, gender: true}))
    }
  }

  const isFormValid = () => {
    if (firstName.length > 0 && lastName.length > 0  && selectedCountry.length > 0 && 
      selectedState.length > 0) {
      return true
    } else {
      return false
    }
  }

  const handleSubmit = async () => {

    checkAllFields()

    if (!isFormValid()) {
      toast.error("Please fill all input fields!");
      return 
    }

    const schoolProblem = schoolChoiceProblem(schoolChoice)
    if (schoolProblem) {
      toast.error(schoolProblem);
      return
    }
  
    let formatted = null

    if (startDate) {
      const date = new Date(startDate);
      formatted = date.getFullYear() +
      '-' + String(date.getMonth() + 1).padStart(2, '0') +
      '-' + String(date.getDate()).padStart(2, '0');
      // You can use 'formatted' here as needed
    }

    const payload: {
      firstname: string;
      lastname: string;
      gender: string;
      dob: string | null;
      region: string;
      email: string;
      contactNumber: string;
      // image?: string;
    } = {
      firstname: firstName,
      lastname: lastName,
      gender: gender,
      dob: formatted,
      region: selectedCountry,
      email: email,
      contactNumber: phone,
      // image: photo
    }

    setIsLoading(true)

    let updateData = { ...payload };

    try {
      const response = await upDateUserProfile(
        updateData,
        token as string,
        imageFile
      );
      console.log("response: ", response)
      if(response[0].ok) {
        // The school is optional: a problem saving it never blocks onboarding.
        if (schoolChoice.mode !== 'none') {
          try {
            const msg = await saveSchoolChoice(schoolChoice)
            if (msg) toast.success(msg)
            try { localStorage.removeItem('at_join_school') } catch { /* ignore */ }
          } catch (e: any) {
            toast.error(e?.response?.data?.message || 'We could not save your school. You can add it later in Profile and settings.')
          }
        }
        toast.success("Profile updated successfully");
        setTimeout(() => {
          // navigate("/dashboard")
          window.location.href = "/dashboard";
        }, 3000)
      }

    } catch (error) {
      
      console.error("Error updating user profile", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
  };

// ...existing code...

return (
  <div className="relative min-h-screen w-full bg-[#ffffff]">
    <Header />

    <div className="p-5 sm:p-5 w-full">
      <img src={companyLogo} alt='Logo Text' className='h-[30px]' />

      <div className='w-full max-w-[650px] border-[2px] border-[#ccc] rounded-lg mx-auto mt-5 sm:mt-20 p-3 sm:p-5 py-6 sm:py-10 flex flex-col gap-y-6 sm:gap-y-[30px]'>
        <div>
          <p className='text-[#101828] text-[22px] sm:text-[25px] font-semibold'>Personal Details</p>
          <p className='text-[#757575] text-[13px] sm:text-[14px]'>
            Provide the following information to help us recommend the <br className="hidden sm:block" /> best suitable course of study and experience.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Circle Preview */}
          <label className="relative flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 overflow-hidden cursor-pointer">
            {photo ? (
              <img
                src={photo}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-xl">+</div>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handlePhotoChange}
            />
          </label>

          {/* Upload Button + Optional Text */}
          <div className='mt-2'>
            {uploadError && <p className='text-[red] text-[12px]'>{uploadError}</p>}
            <label className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
            <p className="text-sm text-gray-400 mt-1">Optional</p>
          </div>
        </div>

        {/* Responsive form grid */}
        <div className='flex flex-col sm:flex-row gap-y-4 sm:gap-y-0 gap-x-0 sm:gap-x-[20px]'>
          <div className="flex flex-col gap-y-[5px] w-full sm:w-1/2">
            <p className={`text-[12px] ${errorObj.firstName ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>First Name*</p>
            <input
              type="text"
              placeholder="Enter First Name"
              onFocus={() => setErrorObj((prev) => ({...prev, firstName: false}))}
              disabled={false}
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border-[1px] px-[10px] rounded-md border-[#E9E9E9] py-2 focus:outline-none w-full text-[16px] font-[400] text-[black]"
            />
          </div>

          <div className="flex flex-col gap-y-[5px] w-full sm:w-1/2">
            <p className={`text-[12px] ${errorObj.lastName ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>Last Name*</p>
            <input
              type="text"
              placeholder="Enter Last Name"
              onFocus={() => setErrorObj((prev) => ({...prev, lastName: false}))}
              disabled={false}
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border-[1px] px-[10px] rounded-md border-[#E9E9E9] py-2 focus:outline-none w-full text-[16px] font-[400] text-[black]"
            />
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-y-4 sm:gap-y-0 gap-x-0 sm:gap-x-[20px]'>
          <div className="flex flex-col gap-y-[5px] w-full sm:w-1/2">
            <p className={`text-[12px] ${errorObj.email ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>Email Address*</p>
            <input
              type="email"
              placeholder="johndoe@gmail.com"
              onFocus={() => setErrorObj((prev) => ({...prev, email: false}))}
              disabled
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-[1px] px-[10px] rounded-md border-[#E9E9E9] py-2 focus:outline-none w-full text-[16px] font-[400] text-[black]"
            />
          </div>

          <div className="flex flex-col gap-y-[5px] w-full sm:w-1/2">
            <p className={`text-[12px] ${errorObj.phone ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>Phone Number*</p>
            <PhoneInput
              country={'ng'}
              value={phone}
              onChange={(phone) => setPhone(phone)}
              onFocus={handlePhoneError}
              inputStyle={{
                width: '100%',
                height: '40px',
                borderRadius: '0.5rem',
                border: '1px solid #ccc',
              }}
              buttonStyle={{
                borderTopLeftRadius: '0.5rem',
                borderBottomLeftRadius: '0.5rem',
              }}
              containerStyle={{ width: '100%' }}
            />
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-y-4 sm:gap-y-0 gap-x-0 sm:gap-x-[20px]'>
          <div className="flex flex-col gap-y-[5px] w-full sm:w-1/2">
            <p className={`text-[12px] ${errorObj.gender ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>Gender*</p>
            <CustomSelect
              placeholder="Select your gender"
              options={["MALE", "FEMALE"].map((schtype) => ({
                value: schtype,
                label: schtype,
              }))}
              onChange={(value: string) => setGender(value)}
              handleError={handleGenderError}
            />
          </div>

          <div className="flex flex-col gap-y-[5px] w-full sm:w-1/2">
            <p className={`text-[12px] ${errorObj.dob ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>Date of Birth*</p>
            <div className="h-[40px] w-full relative flex items-center justify-between border rounded-md bg-white">
              {/* <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={startDate}
                onFocus={handleDobError}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="outline-none w-full text-[14px] text-[#595959] font-semibold"
              /> */}

              <EnhancedDatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                placeholder="dd/mm/yyyy"
                onFocus={handleDobError}
                className={errorObj.dob ? 'border-red-500 outline-none w-full text-[14px] text-[#595959] font-semibold' : 'border-gray-300 outline-none w-full text-[14px] text-[#595959] font-semibold'}
              />
              {/* <MdOutlineCalendarToday className="h-5 w-5 text-gray-400" /> */}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-y-4 sm:gap-y-0 gap-x-0 sm:gap-x-[20px]">
          <div className="w-full sm:w-1/2">
            <p className={`text-[12px] ${errorObj.country ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>Country*</p>
            <SearchSelect
              placeholder="Select Country"
              options={Object.keys(countryStateData).map((country) => ({
                value: country,
                label: country,
              }))}
              onChange={(value) => setSelectedCountry(value)}
              handleError={handleCountryError}
            />
          </div>

          <div className="w-full sm:w-1/2">
            <p className={`text-[12px] ${errorObj.state ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>State*</p>
            <SearchSelect
              placeholder="Select State"
              options={states.map((state) => ({
                value: state,
                label: state,
              }))}
              onChange={(value) => setSelectedState(value)}
              disabledState={selectedCountry ? false : true}
              selectedProps={selectedDefaultState}
              handleError={handleStateError}
            />
          </div>
        </div>
      </div>

      <div className='mt-8 w-full max-w-[640px] mx-auto rounded-2xl border border-[#E4E9F0] bg-white p-4 sm:p-5'>
        <SchoolPicker value={schoolChoice} onChange={setSchoolChoice} preselectId={joinSchool} />
      </div>

      <div className='mt-10 w-full flex justify-center'>
        <button onClick={handleSubmit} className='h-[50px] bg-[#004085] rounded-lg text-[white] font-semibold text-[18px] sm:text-[20px] w-full max-w-[200px]'>
          { isLoading ? <BeatLoader /> : "Submit"}
        </button>
      </div>    
    </div>
  </div>
)
}

export default OnboardingPage
