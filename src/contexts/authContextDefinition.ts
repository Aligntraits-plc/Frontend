import React, { createContext } from "react";
import { User } from "../types/auth.types";
import { RequirementList } from "../types/course.types";
// interface User {
//   firstName: string;
//   lastName: string;
//   email: string;
//   gender: string;
//   image: string;
//   dateOfBirth: string;
//   bio: string;
//   region: string;
//   currentSkill: string;
//   courseOfInterest: string;
// }

export interface Admin {
  email: string;
  image: string | null;
  role: string;
  id: string;
  username: string;
  firstname?: string;
  lastname?: string;
}

export interface PageDesc {
  title: string;
  desc: string;
}

export interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  pageDesc: PageDesc | null;
  setPageDesc: React.Dispatch<React.SetStateAction<PageDesc | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setCurrentCourseID: React.Dispatch<React.SetStateAction<string | null>>;
  setAcademicRecord: React.Dispatch<React.SetStateAction<RequirementList[]>>;
  academicRecord: RequirementList[];
  academicRecordId: string;
  setAcademicRecordId: React.Dispatch<React.SetStateAction<string>>;

  setCreatingCourseClicked: React.Dispatch<React.SetStateAction<boolean>>;
  setAdmin: React.Dispatch<React.SetStateAction<Admin | null>>;
  login: (email: string, password: string) => Promise<void | number>;
  googleLogin: () => Promise<void | number>;
  logout: () => Promise<void>;
  register: (
    firstname: string,
    lastname: string,
    email: string,
    password: string
  ) => Promise<void>;
  verifyEmailToken: (
    email: string,
    password: string,
    token: string
  ) => Promise<{ status: number }>;
  isLoading: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  token: string | undefined;
  isAuthenticated: boolean;
  currentCourseID: string | null;
  creatingCourseClicked: boolean;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  setSearchAllTerm: React.Dispatch<React.SetStateAction<string>>;
  searchAllTerm: string;
  setToken: React.Dispatch<React.SetStateAction<string | undefined>>;
  startDate: string;
  endDate: string;
  setDatePickerClicked: React.Dispatch<React.SetStateAction<boolean>>;
  datePickerClicked: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  admin: null,
  setAdmin: () => {},
  setUser: () => {},
  login: async () => {},
  googleLogin: async () => {},
  setToken: () => {},
  logout: async () => {},
  register: async () => {},
  verifyEmailToken: async () => ({ status: 0 }),
  isLoading: false,
  error: null,
  token: undefined,
  isAuthenticated: false,
  currentCourseID: null,
  creatingCourseClicked: false,
  setCurrentCourseID: () => {},
  setCreatingCourseClicked: () => {},
  setError: () => {},
  setEndDate: () => {},
  setStartDate: () => {},
  endDate: "",
  startDate: "",
  setSearchAllTerm: () => {},
  searchAllTerm: "",
  setDatePickerClicked: () => {},
  datePickerClicked: false,
  pageDesc: null,
  setPageDesc: () => {},
  setAcademicRecord: () => {},
  academicRecord: [],
  academicRecordId: "",
  setAcademicRecordId: () => {},
});
