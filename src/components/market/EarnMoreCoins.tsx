"use client";

import React, { useEffect, useState } from "react";
import {
  approved,
  Calendar,
  dollarCoin,
  Youtube,
} from "../../../public/newImages";
import Image from "next/image";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

import { formatNumber } from "../../../utils/formatNumber";
import { checkRewardStatus, claimReward } from "@/actions/bonus.actions";
import Link from "next/link";
import toast from "react-hot-toast";
import { completeTask, tasksList, TaskToShow } from "@/actions/tasks.actions";
import { Skeleton } from "../ui/skeleton";
import { usePointsStore } from "@/store/PointsStore";
import { useBoostersStore } from "@/store/useBoostrsStore";
import { useSearchParams } from "next/navigation";
import { useYouTubeMutation } from "@/hooks/mutation/useYouTube";
import { useFetchYoutubeTasks } from "@/hooks/query/useFetchYouTubeTask";
import { useFetchTasks } from "@/hooks/query/useFetchTask";
import { useTasksMutation } from "@/hooks/mutation/useTasksMutation";

interface Reward {
  id?: string;
  userId?: string;
  day: number;
  coins: number;
  createdAt?: Date;
}

type Task = {
  id: string;
  name: string;
  points: number;
  category: string;
  icon: string;
  link: string;
  isUserTask: boolean;
};

const EarnMoreCoins = () => {
  const dailyRewards = [
    { day: 1, reward: 500 },
    { day: 2, reward: 1000 },
    { day: 3, reward: 2500 },
    { day: 4, reward: 5000 },
    { day: 5, reward: 15000 },
    { day: 6, reward: 25000 },
    { day: 7, reward: 100000 },
    { day: 8, reward: 500000 },
    { day: 9, reward: 1000000 },
    { day: 10, reward: 5000000 },
  ];

  const [isOpen, setIsOpen] = useState(false);

  const [rewards, setReward] = useState<Reward | null>(null);
  const [nextRewardAvailable, setNextRewardAvailable] = useState(false);
  // const [taskList, setTaskList] = useState<Task[]>();
  // const [isLoading, setIsLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);

  const {
    userId: user,
    increaseTapsLeft,
    currentTapsLeft,
    addPoints,
  } = usePointsStore();

  const { multiClickLevel } = useBoostersStore();

  const [buttonLoading, setButtonLoading] = useState(false);

  const YouTubeMutation = useYouTubeMutation();
  const TaskMutation = useTasksMutation();

  const search = useSearchParams();
  const id = search.get("id");

  const { data: YoutubeTask , isLoading: isYouTubeTaskLoading} = useFetchYoutubeTasks(id ?? userId ?? "");
  const { data: taskList , isLoading} = useFetchTasks(id ?? userId ?? "");

  console.log("🚀 ~ EarnMoreCoins ~ YoutubeTask:", YoutubeTask?.tasks);


  const [isYouTubeTaskProcessing, setIsYouTubeTaskProcessing] = useState(false);


  useEffect(() => {
    const intervalId = setInterval(() => {
      increaseTapsLeft();
      const local = parseInt(
        window.localStorage.getItem("currentTapsLeft") ?? "0"
      );

      if (local < currentTapsLeft && !isNaN(currentTapsLeft)) {
        window.localStorage.setItem(
          "currentTapsLeft",
          (currentTapsLeft + multiClickLevel).toString()
        );
      }
    }, 1000); // Adjust interval as needed

    return () => clearInterval(intervalId);
  }, [currentTapsLeft]);

  useEffect(() => {
    const userId = window.localStorage.getItem("authToken"); // Ensure userId is properly handled
    setUserId(userId);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const checkReward = async () => {
      if (!userId) return;
      const data = await checkRewardStatus(userId, userTimezone);
      setNextRewardAvailable(data.nextRewardAvailable!);
      setReward(data.lastReward!);
    };

    checkReward();
  }, [userId]);

  const handleClaimReward = async () => {
    if (!userId) return;
    setButtonLoading(true);
    const loadingToastId = toast.loading("Claiming reward...");
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const data = await claimReward(userId, userTimezone);
    if (data.success && data.reward) {
      setNextRewardAvailable(false);
      setReward((prev) => ({
        day: (prev?.day || 0) + 1,
        coins: data.reward || 0,
      }));

      addPoints(data.reward);

      toast.success(`Reward claimed successfully! ${data.reward}`);
    } else {
      console.log(data.error);
      toast.error("Something went wrong!");
      toast.dismiss(loadingToastId);
      setButtonLoading(false);
    }

    toast.dismiss(loadingToastId);
    setButtonLoading(false);
  };

  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // useEffect(() => {
  //   const checkWindowDefined = () => {
  //     if (typeof window !== "undefined") {
  //       const authToken = window.localStorage.getItem("authToken");
  //       setUserId(authToken);
  //       if (authToken) {
  //         const getAllTask = async () => {
  //           const tasks = await TaskToShow(authToken);
  //           if (tasks && tasks.length > 0) {
  //             // setTaskList(tasks);
  //             // setIsLoading(false);
  //           } 
  //         };
  //         getAllTask();
  //       }
  //     } else {
  //       setTimeout(checkWindowDefined, 100); // Retry after 100ms
  //     }
  //   };

  //   checkWindowDefined();
  // }, []);

  const handleCompleteTask = async (task: Task) => {
    if (!userId) return;

    if (userId && !isYouTubeTaskProcessing) {
      setIsYouTubeTaskProcessing(true);
      TaskMutation.mutate(
        { userId, taskId: task.id },
        {
          onSuccess: () => {
            toast.success("Task completed successfully!");
            addPoints(task.points);
            window.localStorage.setItem(
              "points",
              `${
                parseInt(window.localStorage.getItem("points") || "0") +
                task.points
              }`
            );
            setIsYouTubeTaskProcessing(false);
          },
        }
      );
    }
  };

  const handleCompleteYoutube = async (task: Task) => {
    if (userId && !isYouTubeTaskProcessing) {
      setIsYouTubeTaskProcessing(true);
      YouTubeMutation.mutate(
        { userId, taskId: task.id },
        {
          onSuccess: () => {
            toast.success("Task completed successfully!");
            addPoints(task.points);
            window.localStorage.setItem(
              "points",
              `${
                parseInt(window.localStorage.getItem("points") || "0") +
                task.points
              }`
            );
            setIsYouTubeTaskProcessing(false);
          },
        }
      );
    }
  };

  return (
    <div className="p-4 bg-black flex-grow  bg-opacity-60 backdrop-blur-none rounded-t-3xl top-glow border-t-4 border-[#f3ba2f]  text-white max-w-xl pb-20 mx-auto shadow-lg">
      <div className="flex flex-col items-center mb-6">
        <div className="glowing-coin my-8">
          <Image src={dollarCoin} alt="TON Wallet" width={150} height={150} />
        </div>
      </div>
      <div className="flex flex-col items-center mb-4 ">
        <h1 className="text-2xl font-bold">Earn more coins</h1>
      </div>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Beestar Youtube</h2>

          {isYouTubeTaskLoading && <> <Skeleton className="w-full h-20" /></>}
          {YoutubeTask?.tasks.map((task) => (
            <>
              <button
              disabled={task.isUserTask  || isYouTubeTaskProcessing}
                onClick={() => handleCompleteYoutube(task)}
                className="p-4 bg-[#1d2025] shadow-xl border border-yellow-400 bg-opacity-85 backdrop-blur-none rounded-2xl flex items-center justify-between "
              >
                <Link href={task.link} target="_blank">
                  <div className="flex items-center">
                    <Image
                      src={task.icon}
                      alt="YouTube"
                      className="w-12 h-12 mr-4"
                      width={50}
                      height={50}
                    />
                    <div>
                      <p className="font-semibold text-start">{task.name}</p>
                      <p className="text-yellow-400  flex items-center justify-start gap-1">
                        <Image
                          src={dollarCoin}
                          alt="Coin"
                          className="w-4 h-4 "
                        />
                        +{task.points}
                      </p>
                    </div>
                  </div>
                </Link> 
                {task.isUserTask && (
                  <Image
                    src={approved}
                    alt="approved icon"
                    className="w-12 h-12"
                  />
                )}
              </button>
            </>
          ))}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Daily tasks</h2>
          <div className="p-4 bg-[#1d2025] shadow-xl border border-yellow-400 bg-opacity-85 backdrop-blur-none rounded-2xl flex items-center justify-between">
            <div>
              <p className="flex items-center " onClick={() => setIsOpen(true)}>
                <Image
                  src={Calendar}
                  alt="Daily Reward"
                  className="w-12 h-12 mr-4"
                />
                <span className="">
                  Daily reward:{" "}
                  <span className="text-yellow-400 flex items-center justify-between  gap-1">
                    <Image src={dollarCoin} alt="Coin" className="w-4 h-4 " />
                    +6,649,000{" "}
                  </span>
                </span>
              </p>
              <Drawer open={isOpen}>
                {/* <DrawerOverlay className=""  /> */}
                <DrawerContent className="bg-[#14161a]  border-none px-2 ">
                  <DrawerHeader className="flex items-center justify-end  mt-4 ">
                    <div
                      onClick={() => setIsOpen(false)}
                      className="z-[100] absolute p-3 px-5 text-white bg-[#1C1F23] rounded-full"
                    >
                      x
                    </div>
                  </DrawerHeader>

                  <div className="text-center ">
                    <Image
                      src={Calendar}
                      alt="Daily Reward"
                      className="mx-auto w-12 h-12 mb-4"
                    />
                    <div className="flex justify-between items-center">
                      <span className="  mx-auto text-white text-xl font-semibold">
                        Daily reward
                      </span>
                    </div>
                    <p className="text-white text-xs max-w-64 mx-auto my-4">
                      Accrue coins for logging into the game daily without
                      skipping
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {dailyRewards.map(({ day, reward }) => (
                      <div
                        key={day}
                        className={`px-2 py-2 flex flex-col items-center justify-center gap-1 rounded-lg text-center ${
                          reward && (rewards?.day ?? 0) === day
                            ? "border border-green-600"
                            : (rewards?.day ?? 0) > day
                            ? "bg-green-600"
                            : "bg-[#222429]"
                        }`}
                      >
                        <p className="text-xs text-white">Day {day}</p>
                        <Image
                          src={dollarCoin}
                          alt="Coin"
                          className="w-5 h-5"
                        />
                        <p className="text-xs font-semibold  text-white">
                          {formatNumber(reward)}{" "}
                        </p>
                      </div>
                    ))}
                  </div>

                  <DrawerFooter className=" p-0">
                    <Button
                      onClick={handleClaimReward}
                      disabled={!nextRewardAvailable || buttonLoading}
                      className="w-full p-7 my-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700"
                    >
                      {buttonLoading ? <div className="loader"></div> : "Claim"}
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Tasks list</h2>
          {isLoading ? (
            // Skeleton loader
            <Skeleton className="w-full h-20" />
          ) : (
            taskList &&
            taskList.length > 0 &&
            taskList.map((task: Task, index) => (
              <button
                disabled={task.isUserTask || isYouTubeTaskProcessing}
                onClick={() => handleCompleteTask(task)}
                key={index}
                className="p-4 bg-[#1d2025] shadow-xl w-full border border-yellow-400 bg-opacity-85 backdrop-blur-none rounded-2xl mt-2 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Image
                    src={task.icon}
                    alt="Telegram"
                    className="w-12 h-12 mr-6"
                    width={50}
                    height={50}
                  />
                  <Link href={task.link} target="_blank">
                    <p className="font-semibold text-start">{task.name}</p>
                    <p className="text-yellow-400 flex items-center justify-start gap-1">
                      <Image src={dollarCoin} alt="Coin" className="w-4 h-4" />+
                      {task.points}
                    </p>
                  </Link>
                </div>
                {task.isUserTask && (
                  <Image
                    src={approved}
                    alt="approved icon"
                    className="w-12 h-12"
                  />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EarnMoreCoins;
