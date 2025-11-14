"use client"
import { useEffect, useRef, useState } from "react";
import "./meme.css";
import { LinneChart } from "@/components/meme-comp/LinneChart";
import MemeGenerator from "@/components/meme-comp/MemeGenerator";
import { getGithubInfo, getMemeProfileData } from "@/lib/api";
import { ContributionsData } from "@/types/types";
import { Container } from "@/components/meme-comp/Container";

import { ButtonArrow } from "@/public/assets/buttonArrow";
import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import { Loader } from "@/components/meme-comp/Loader";
import { AxiosError } from "axios";

function page(){
  const [myUserName, setMyUserName] = useState<string>("");
  const [comparerUserInput, setComparerUserInput] = useState<string>("");
  const [myData, setMyData] = useState<ContributionsData | null>(null);
  const [comparerData, setComparerData] = useState<ContributionsData | null>(null);
  const [myName, setMyName] = useState<string>("");
  const [myTotalContribution, setMyTotalContribution] = useState<number>(0);
  const [comparertotalContri, setComparertotalContri] = useState<number>(0);
  const [comparerName, setComparerName] = useState<string>("");
  const [memeIndex, setMemeIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [loser, setLoser] = useState<string | null>(null);
  const [haveData, setHaveData] = useState<boolean>(false);
  const [myError, setMyError] = useState<string>("");
  const [comparerError, setComparerError] = useState<string>("");
  const headingContainer = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Clear previous data
    setMyData(null);
    setComparerData(null);

    // Start loading
    setIsLoading(true);

    if (myUserName === comparerUserInput) {
      setMyError("You can't compare to yourself :')")
      setIsLoading(false);
      return;
    }
    try {
      const [
        myProfileData,
        myGitHubInfo,
        comparerProfileData,
        comparerGitHubInfo,
      ] = await Promise.all([
        getMemeProfileData(myUserName),
        getGithubInfo(myUserName),
        getMemeProfileData(comparerUserInput),
        getGithubInfo(comparerUserInput),
      ]);

      setMyData(myProfileData);
      setMyName(myGitHubInfo?.name || myUserName);
      setComparerData(comparerProfileData);
      setComparerName(comparerGitHubInfo?.name || comparerUserInput);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status === 404) {
        if (axiosError.config?.url?.includes(myUserName)) {
          setMyError("Username not found");
        } else if (axiosError.config?.url?.includes(comparerUserInput)) {
          setComparerError("Comparer username not found");
        }
      } else {
        console.error("Error fetching data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getMemeIndex = (myContribution: number, comparerContribution: number): number => {
    if (myContribution === 0 && comparerContribution === 0) {
      return 0;
    }
    const maxContribution = Math.max(myContribution, comparerContribution);
    const difference = Math.abs(myContribution - comparerContribution);
    const percentageDifference = (difference / maxContribution) * 100;
    const index = Math.floor(percentageDifference / 10);
    return Math.min(index, 9);
  };

  const downloadImage = (e: React.MouseEvent<HTMLButtonElement>): void => {
    if (!containerRef.current || !headingContainer.current) return;

    if (isMobile) {
      headingContainer.current.style.display = 'none';
    }
    e.currentTarget.style.display = "none";
    html2canvas(containerRef.current, { backgroundColor: "#2b3137" })
      .then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "github-compare.png";
        link.click();
      })
      .catch((error) => {
        console.error("Error capturing the image:", error);
      })
      .finally(() => {
        e.currentTarget.style.display = "flex";
        if (headingContainer.current) {
          headingContainer.current.style.display = 'flex';
        }
      });
  };

  useEffect(() => {
    if (myData && comparerData) {
      const arrOfMyContri = Object.values(myData.total);
      const arrOfComparerContri = Object.values(comparerData.total);

      const myTotalContribution = arrOfMyContri.reduce(
        (total, curVal) => total + curVal,
        0
      );
      setMyTotalContribution(myTotalContribution);

      const comparerTotalContribution = arrOfComparerContri.reduce(
        (total, curVal) => total + curVal,
        0
      );
      setComparertotalContri(comparerTotalContribution);

      const memeIndex = getMemeIndex(
        myTotalContribution,
        comparerTotalContribution
      );
      setMemeIndex(memeIndex);
      const myfirstName = myName.split(" ")[0];
      const comparerfirstName = comparerName.split(" ")[0];

      if (myTotalContribution > comparerTotalContribution) {
        setWinner(myfirstName);
        setLoser(comparerfirstName);
      } else {
        setWinner(comparerfirstName);
        setLoser(myfirstName);
      }
      setHaveData(true);
    }
  }, [myData, comparerData, myName, comparerName]);

  const transition = { duration: 1, ease: "easeInOut" };

  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    // Initialize mobile state after component mounts
    const checkIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };

    const handleResize = (): void => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };

    // Set initial value
    checkIsMobile();

    // Add event listener
    if (typeof window !== 'undefined') {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);
  
  const fontSize = haveData
    ? isMobile
      ? "34px"
      : "52px"
    : isMobile
    ? "44px"
    : "68px";

  const clearDataCallBack = (): void => {
    setMyData(null);
    setMyName('');
    setComparerData(null);
    setComparerName('');
    setHaveData(false);
    setLoser(null);
    setWinner(null);
    setMyError('');
    setComparerError('');
  };

  return (
    <motion.main
      className="body-container h-full"
      style={{
        "--x": "68%",
        "--y": haveData ? "62%" : "100%",
        "--color1": "rgba(74,178,1,1)",
        "--color2": haveData ? "rgba(0,0,0,1)" : "rgba(0,0,0,0)",
        "--position2": haveData ? "50%" : "0%",
      } as React.CSSProperties}
      transition={transition}
    >
      <Container className="h-full pt-7 font-sans">
        
        <div
          ref={containerRef}
          className={`main-container md:h-[725px] flex flex-col pb-24 md:px-8 max-md:pb-8 max-md:w-full`}
        >
          <motion.div
            className="headering-wrapper flex mt-auto max-md:justify-center"
            transition={transition}
            initial={{
              paddingLeft: "calc(50% - 230px)",
            }}
            animate={{
              marginTop: haveData ? "0px" : "200px",
              paddingLeft: haveData ? "0" : "calc(50% - 230px)",
            }}
            ref={headingContainer}
          >
            <motion.h1
              className={`text-white leading-[0.9em] text-left w-fit ${
                haveData ? "mt-8" : ""
              } max-md:text-[34px]`}
              initial={false}
              animate={{
                fontSize: fontSize,
                fontWeight: haveData ? 600 : 700,
              }}
              transition={transition}
            >
              GitHub Profile <br />{" "}
              <motion.span
                transition={transition}
                initial={false}
                animate={{ marginLeft: haveData ? (isMobile ? "14px": "0px") : "26px" }}
              >
                Comparison
              </motion.span>
            </motion.h1>
          </motion.div>
          <AnimatePresence>
            {!haveData && (
              <motion.form
                initial={{ translateY: 10, scale: 1.1, opacity: 0 }}
                animate={{ translateY: 0, scale: 1, opacity: 1 }}
                exit={{
                  scale: 0.9,
                  opacity: 0,
                  translateY: -100,
                  height: "0%",
                }}
                transition={transition}
                onSubmit={handleSubmit}
                className="flex flex-wrap justify-center mt-4 max-md:flex-col max-md:w-full max-md:items-center "
              >
                <div className="my-info w-5/12 text-center relative max-md:w-full">
                  {myError && (
                    <p className="text-red-500 absolute font-bold -bottom-4 left-20  max-md:-bottom-6">
                      {myError}
                    </p>
                  )}
                  <input
                    value={myUserName}
                    onChange={(e) => setMyUserName(e.currentTarget.value)}
                    placeholder="Your Username"
                    required
                    className={`border bg-white shadow-[0px_4px_50px_rgba(0,_255,_87,_0.5)] w-[294px] ${
                      myError ? " outline outline-red-500" : ""
                    } py-3 px-4 text-[18px] rounded-full`}
                  />
                </div>
                <div className="vs-wrapper font-bold text-[38px] text-white border-[2px] border-white aspect-square w-[64px] rounded-full grid content-center justify-center max-md:my-6">
                  {isLoading ? <Loader /> : <span>VS</span>}
                </div>
                <div className="comparer-info w-5/12 text-center relative max-md:w-full">
                  {comparerError && (
                    <p className="text-red-500 absolute font-bold -bottom-4 right-20 max-md:-bottom-6">{comparerError}</p>
                  )}
                  <input
                    value={comparerUserInput}
                    onChange={(e) =>
                      setComparerUserInput(e.currentTarget.value)
                    }
                    placeholder="Enter other persons username"
                    required
                    className={`border bg-white shadow-[0px_4px_50px_rgba(0,_255,_87,_0.5)] w-[294px] ${
                      comparerError ? " outline outline-red-500" : ""
                    } py-3 px-4 text-[18px] rounded-full`}
                  />
                </div>
                <div className="button-wrapper w-full flex justify-center items-center  mt-10">
                  <button
                    type="submit"
                    className="bg-transparent text-white pl-9 border-[2px] flex items-center border-white rounded-full gap-9"
                  >
                    COMPARE
                    <span className="bg-white rounded-full h-[54px] aspect-square grid content-center justify-center border-[2px] border-white">
                      <ButtonArrow />
                    </span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {myData && comparerData && (
              <motion.div
                initial={{ opacity: 0, translateY: 100, scale: 0.8 }}
                exit={{ scale: 0.9, opacity: 0, translateY: -100 }}
                animate={{ translateY: 0, scale: 1, opacity: 1 }}
                transition={transition}
                className="comparison-container flex max-md:flex-col-reverse"
              >
                <div className="line-graph w-8/12 mt-8 max-md:w-full max-md:px-4">
                  <LinneChart
                    userNames={{ myname: myName, comparerName: comparerName }}
                    myData={myData?.total}
                    comparerData={comparerData?.total}
                  />
                  <div className="total-contri text-white flex gap-10 mt-10">
                    <div className="my-contri text-left flex items-center gap-3">
                      <div className="w-[54px] rounded-md bg-[#63FF60] aspect-square border border-black"></div>
                      <div className="myInfo">
                        <h1 className="my-name font-semibold text-[20px]">
                          {myName}
                        </h1>
                        <p className="text-[12px] text-[#EAEAEA] font-light">
                          Total Contribution : {myTotalContribution}
                        </p>
                      </div>
                    </div>
                    <div className="comparer-contri text-left flex items-center gap-3">
                      <div className="w-[54px] rounded-md bg-[#FFE55B] aspect-square border border-black"></div>
                      <div className="comparerInfo">
                        <h1 className="comparer-name font-semibold text-[20px]">
                          {comparerName}
                        </h1>
                        <p className="text-[12px] text-[#EAEAEA] font-light">
                          Total Contribution : {comparertotalContri}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                </div>
                <div className="meme  flex flex-col justify-start mt-10 gap-6 ml-auto max-w-[400px] max-md:max-w-full max-md:ml-0 max-md:gap-0">
                  <div className="canvas-wrapper max-md:flex max-md:justify-center">
                    {winner && loser && (
                      <MemeGenerator
                        winnerName={winner}
                        loserName={loser}
                        memeIndex={memeIndex}
                      />
                    )}
                  </div>
                 
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </motion.main>
  );
}

export default page;
