import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { FaLongArrowAltLeft } from "react-icons/fa";
import resetIcon from "../assets/recommedationIcon.svg"
import menuIcon from "../assets/androidMenu.svg"
import { questions, questionText } from "../data/questions";
import { BeatLoader } from "react-spinners";
import {toast} from 'react-toastify'
import { sendCareerPath } from "../services/utils";
import { useAuth } from "../contexts/useAuth";

type Answers = {
  [questionId: string]: string; // e.g., { q1: "blue", q2: "laptop" }
};

export default function Questionaire() {
  const navigate = useNavigate()
  const { token } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const question = questions[currentIndex];
  const [showSignUpBtn, setShowSignUpBtn] = useState(false)

  const [answers, setAnswers] = useState<Answers>(() => {
    const stored = localStorage.getItem("questionnaire-answers");
      return stored ? JSON.parse(stored) : {};
  });
  const [isLoading, setIsLoading] = useState(false);

  const foundUser = localStorage.getItem("userData");
  const data = foundUser ? JSON.parse(foundUser) : {ok: false};


  function handleSelectAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  const next = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = async () => {
    // setShowSignUpBtn(true)
    // console.log("setShowSignUpBtn: ", setShowSignUpBtn)
    setIsLoading(true)

    let storedUserDetailsRaw = localStorage.getItem("pathway-data");
    let storedUserDetails: { firstName?: string; lastName?: string; email?: string } = {};

    if (storedUserDetailsRaw) {
      try {
        storedUserDetails = JSON.parse(storedUserDetailsRaw) || {};
      } catch {
        storedUserDetails = {};
      }
    }

    let answerArray: { question: string; answer: string }[] = [];

    questions.forEach((question) => {
      const answer = answers[question.id];
      if (answer) {
        answerArray.push({
          question: question.question,
          answer: answer,
        });
      }
    })

    const finalObject = {
      "answers": answerArray,
      "firstName": storedUserDetails.firstName || "",
      "lastName": storedUserDetails.lastName || "",
      "email": storedUserDetails.email || "",
    }

    try {
      setIsLoading(true)
      const response = await sendCareerPath(finalObject);

      console.log("response: ", response);
      if (response.ok === true) {
        setShowSignUpBtn(true)
      }

    } catch (e) {
      toast.error("An error occurred while submitting your answers. Please try again later.");
      console.error("Error submitting answers: ", e);
    } finally {
      setIsLoading(false)
    }

    setTimeout(() => {
      setIsLoading(false)
      toast.success("Your answers have been submitted successfully!");
    }, 2000)
  }

  function resetAnswers() {
    setAnswers({});

    const storedUserDetailsRaw = localStorage.getItem("pathway-data");
    const dataTwo = storedUserDetailsRaw ? JSON.parse(storedUserDetailsRaw) : {email: ""};
    

    if (data.ok) {
      if (token) {
        navigate("/dashboard")
      } else {
        navigate("/login");
      }
    } else {
      navigate("/setup-password?email=" + dataTwo.email);
    }

    localStorage.removeItem("questionnaire-answers");
    localStorage.removeItem("pathway-data");

  }

  useEffect(() => {
    localStorage.setItem("questionnaire-answers", JSON.stringify(answers));
  }, [answers]);


  return (
    <div className="relative min-h-screen w-full bg-white">
      <Header />

      {showSignUpBtn ? (
        <div className="flex flex-col items-center bg-white p-5 gap-y-5 mt-10">
          <div>
            <img src={resetIcon} alt="reset" className="w-16 sm:w-24" />
          </div>
          <p className="text-[#4C4E53] text-center text-base sm:text-lg">
            Great! we’ve matched you with a career path. Please {!data.ok ? "sign up" : token ? "click here" : "login"} to view your result.
          </p>
          <button
            type="submit"
            onClick={resetAnswers}
            className="w-full max-w-xs h-12 mx-auto py-2 px-4 bg-[#004085] hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 text-base sm:text-lg"
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="mx-[20px]">
          <div
            className="flex gap-x-2 items-center ml-4 mt-4 cursor-pointer sm:ml-8 sm:mt-6"
            onClick={() => navigate(-1)}
          >
            <FaLongArrowAltLeft className="text-[#004085] text-lg sm:text-xl" />
            <p className="text-[#004085] text-sm sm:text-base">Back to Explore</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mt-5 w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4 px-2">
                <img src={menuIcon} alt="menu" className="w-10 md:w-14 hidden lg:block" />
                <div className="flex-1">
                  <p className="mb-3 w-full text-base sm:text-xl text-[#757575] font-semibold text-center sm:text-left">
                    Question {currentIndex + 1}/{questions.length}:
                  </p>
                  <div className="w-full sm:w-[600px] h-auto min-h-[180px] space-y-4 flex flex-col p-4 sm:p-6 bg-white rounded-lg shadow-lg border-0 sm:border border-[#ccc]">
                    <p className="text-[#101828] text-base sm:text-lg font-semibold">{questionText(question)}</p>
                    <div className="flex flex-col space-y-4 ml-2 sm:ml-8">
                      {question.options.map((elem) => (
                        <label key={elem.value} className="flex items-center gap-x-3">
                          <input
                            type="radio"
                            name={question.id}
                            value={elem.value}
                            checked={answers[question.id] === elem.value}
                            onChange={() => handleSelectAnswer(question.id, elem.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-[#101828] text-base sm:text-lg font-semibold">{elem.value}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 w-full px-2">
            {currentIndex !== 0 && (
              <button
                onClick={prev}
                disabled={currentIndex === 0}
                className="w-full sm:w-48 px-4 py-2 bg-[#F6C648] text-[#101828] font-semibold text-base sm:text-lg rounded-xl disabled:opacity-50"
              >
                Back
              </button>
            )}

            {currentIndex !== questions.length - 1 && (
              <button
                onClick={next}
                disabled={currentIndex === questions.length - 1}
                className="w-full sm:w-48 px-4 py-2 bg-[#004085] text-white font-semibold text-base sm:text-lg rounded-xl disabled:opacity-50"
              >
                Next
              </button>
            )}

            {currentIndex === questions.length - 1 && (
              <button
                onClick={handleSubmit}
                className="w-full sm:w-48 px-4 py-2 bg-[#004085] text-white font-semibold text-base sm:text-lg rounded-xl disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? <BeatLoader size={10} color="#fff" /> : "Submit"}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="h-5 w-full" />
    </div>
  );
} 