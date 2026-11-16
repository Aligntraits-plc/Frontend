import React, { useState, useEffect } from "react";
import CustomSelect from "../dashboard/CustomSelect";
import SearchSelect from "../dashboard/SearchSelect";
import ImageUpload from "./ImageUpload";
import api from "../../api/axios";
import { useAuth } from "../../contexts/useAuth";
import { BeatLoader } from "react-spinners";
import {toast} from 'react-toastify'
import countriesData from "../../data/countries_states.json"
// import { getSchools, School } from "../../services/schools";

interface Data {
  logo: File | null;
  name: null | string;
  location: null | string;
  schoolType: string;
}  

interface ModalProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  // setSchool: React.Dispatch<React.SetStateAction<School[]>>;
  schooTypeDefault: string;
  defaultImgUrl: string;
  defaultName: string;
  selectedProps: {
    value: string;
    label: string
  };
  schoolId: string;
  fetchSchool: Function;
  websiteUrl: string
}

const countryStateData: Record<string, string[]> = {
};

countriesData.map((elem:any) => {
  countryStateData[elem.name] = elem.states
})


export default function EditSchoolModal({
  setShowModal, schooTypeDefault, 
  defaultImgUrl, defaultName, selectedProps, schoolId, fetchSchool, websiteUrl}: ModalProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  //   {
  //     id: 1,
  //     name: "Federal University",
  //     value: "FEDERAL_UNIVERSITY",
  //     checked: false,
  //   },
  //   {
  //     id: 2,
  //     name: "Private University",
  //     value: "PRIVATE_UNIVERSITY",
  //     checked: false,
  //   },
  //   {
  //     id: 3,
  //     name: "Public University",
  //     value: "PUBLIC_UNIVERSITY",
  //     checked: false,
  //   },
  // ]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null | ArrayBuffer>(
    null
  );
  const [nameText, setNameText] = useState("")
  const [url, setUrl] = useState("")

  const [data, setData] = useState<Data>({
    logo: imageFile,
    name: "",
    schoolType: "",
    location: null,
  });

  const [selectedCountry, setSelectedCountry] = useState<string>(String(selectedProps?.label || "").split("/")[0] || "");
  const [selectedState, setSelectedState] = useState<string>(String(selectedProps?.label || "").split("/")[1] || "");
  const [selectedDefaultState, setSelectedDefaultState] = useState({
    value: String(selectedProps?.label || "").split("/")[1] || "",
    label: String(selectedProps?.label || "").split("/")[1] || ""
  })


  const [selectedDefaultCountry, setSelectedDefaultCountry] = useState({
    value: String(selectedProps?.label || "").split("/")[0] || "",
    label: String(selectedProps?.label || "").split("/")[0] || ""
  })

  const [errorObj, setErrorObj] = useState({
    previewUrl: false,
    name: false,
    schoolType: false,
    country: false,
    state: false,
    websiteUrl: false

  })

  const checkAllFields = () => {
    if (selectedCountry.length === 0) {
      setErrorObj((prev) => ({...prev, country: true}))
    }
    if (selectedState.length === 0) {
      setErrorObj((prev) => ({...prev, state: true}))
    }
    if (nameText.length === 0) {
      setErrorObj((prev) => ({...prev, name: true}))
    }
    if (data.schoolType.length === 0) {
      setErrorObj((prev) => ({...prev, schoolType: true}))
    }

    if (url.length === 0) {
      setErrorObj((prev) => ({...prev, websiteUrl: true}))
    }

    if (!previewUrl) {
      setErrorObj((prev) => ({...prev, previewUrl: true}))
    }
  }


  useEffect(() => {
    setData((prevData) => ({ ...prevData, logo: imageFile }));
  }, [imageFile]);


  useEffect(() => {
    setPreviewUrl(defaultImgUrl)
    setNameText(defaultName);
    setUrl(websiteUrl)

    setData((prevData) => ({ 
      ...prevData, 
      location: selectedProps.label,
      schoolType: schooTypeDefault,
      websiteUrl: websiteUrl
    }));

  }, [])


  useEffect(() => {
    if (selectedCountry.length > 0 && selectedCountry in countryStateData) {
      setSelectedState(countryStateData[selectedCountry][0])
    }
  }, [selectedCountry]) 


  const states = selectedCountry ? countryStateData[selectedCountry] || [] : [];

  const handleFileError = () => {
    setErrorObj((prev) => ({...prev, previewUrl: false}))
  }

  const handleStateError = () => {
    setErrorObj((prev) => ({...prev, state: false}))
  }

  const handleCountryError = () => {
    setErrorObj((prev) => ({...prev, country: false}))
  }

  const handleTypeError = () => {
    setErrorObj((prev) => ({...prev, schoolType: false}))
  }

  const SCHOOLTYPE = [
   "PRIVATE_UNIVERSITY", "PUBLIC_UNIVERSITY"
  ]

  const handleNameChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setNameText(e.currentTarget.value);
    setData({ ...data, name: e.currentTarget.value })
  };

  const handleUrlChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setUrl(e.currentTarget.value);
  };



  const isFormValid = () => {
    if (previewUrl && nameText.length > 0 && data.schoolType && selectedCountry.length > 0 && 
      selectedState.length > 0) {
      return true
    } else {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    checkAllFields()

    if (!isFormValid()) {
      toast.error("Please fill all input fields!");
      return 
    }
    
    const formData = new FormData()

    if (imageFile) formData.append("logo", data.logo!); 
    formData.append("name", nameText || "");
    formData.append("schoolType", data.schoolType || "");
    // formData.append("location", `${selectedCountry}/${selectedState}` || "");
    formData.append("region", selectedState)
    formData.append("country", selectedCountry)
    formData.append("websiteUrl", url)
    // formData.append("websiteUrl", "www.schoolxyz.com")

    try {
        setIsLoading(true);
      const response = await api.patch(`/school/update/${schoolId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setShowModal(false)

      if (response.data.ok) {
        toast.success('School Updated Successfully')
        fetchSchool()
      } else {
        toast.error(response.data.message)
      }

    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
       
        const errors = err.response.data.errors;

        errors.forEach((error: { message: string }) => {
          if (error.message) {
            toast.error(error.message);
          }
        });
      }
      if(err.response && err.response.data) {

        toast.error(err.response.data.error)
      }

      if (
        err.response &&
        err.response.data.message &&
        !err.response.data.errors
      ) {
        toast.error(err.response.data.message);
      }

  
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-white p-10">
      <div className="relative">
        <h2 className="text-[18px] font-semibold">
          Update School
        </h2>
        <p className="text-[12px] text-[#737373] font-normal">Edit school with all required details.</p>
      </div>
      <div>
        <form className="space-y-6  mt-[20px]" onSubmit={handleSubmit}>
          <div className="w-[300px]">
            <p className={`text-[12px] ${errorObj.previewUrl ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>School Logo*</p>
            <ImageUpload
              setImageFile={setImageFile}
              imageFile={imageFile}
              previewUrl={previewUrl}
              errorState={errorObj.previewUrl}
              handleFileError={handleFileError}
              setPreviewUrl={setPreviewUrl}
            />
          </div>
          <div>
            <p className={`text-[12px] ${errorObj.name ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>School Name*</p>
            <input
              type="text"
              placeholder="School Name"
              name="schoolName"
              onFocus={() => setErrorObj((prev) => ({...prev, name: false}))}
              value={nameText}
              onChange={handleNameChange}
              className="border-[1px] px-[10px] rounded-md border-[#E9E9E9] py-2 focus:outline-none w-full text-[16px] font-[400] text-[black]"
            />
          </div>

          <div>
            <p className={`text-[12px] ${errorObj.websiteUrl ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>School URL*</p>
            <input
              type="text"
              placeholder="School URL"
              name="schoolURL"
              onFocus={() => setErrorObj((prev) => ({...prev, websiteUrl: false}))}
              value={url}
              onChange={handleUrlChange}
              className="border-[1px] px-[10px] rounded-md border-[#E9E9E9] py-2 focus:outline-none w-full text-[16px] font-[400] text-[black]"
            />
          </div>

          <div>
            <p className={`text-[12px] ${errorObj.schoolType ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>School Type*</p>
            <CustomSelect
              placeholder="Select School Type"
              options={SCHOOLTYPE.map((schtype) => ({
                value: schtype,
                label: schtype,
              }))}
              onChange={(value) => setData({ ...data, schoolType: value })}
              selectedProps={{value: data.schoolType, label: data.schoolType}}
              handleError={handleTypeError}
            />
          </div>

          <div className="flex gap-x-[20px]">
            <div className="w-full">
              <p className={`text-[12px] ${errorObj.country ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>School Country*</p>
              <SearchSelect
                placeholder="Select Country"
                options={Object.keys(countryStateData).map((country) => ({
                  value: country,
                  label: country,
                }))}
                onChange={(value) => {
                  setSelectedDefaultState({
                    value: countryStateData[value][0],
                    label: countryStateData[value][0]
                  })
                  setSelectedDefaultCountry({
                    value: value,
                    label: value
                  })
                  setSelectedCountry(value)
                }}
                selectedProps={selectedDefaultCountry}
                handleError={handleCountryError}
              />
            </div>

            <div className="w-full">
              <p className={`text-[12px] ${errorObj.state ? 'text-[#F04438]' : 'text-[#1E1E1E]'} font-medium`}>School State*</p>
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

          <div className="flex justify-end gap-x-[10px]">
            <button  onClick={()=> setShowModal(false)} className="w-[120px] font-semibold text-[14px] text-[#1E1E1E] py-2 rounded-lg border-[1px] border-[#DDDDDD]">
              Cancel
            </button>
            <button className="w-[120px] bg-[#004085] font-semibold text-[14px] text-[white] py-2 rounded-lg">
                {isLoading ? (
                    <BeatLoader color="#ffffff" size={8} />
                ) : (
                    "Update School"
                )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
