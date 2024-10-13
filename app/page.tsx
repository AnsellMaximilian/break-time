import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/breaktime-full-logo.svg";

import { Bangers } from "next/font/google";

const bangersFont = Bangers({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={cn(
        "flex items-center justify-center grow bg-[url('/break-time-bg.png')] py-8 tracking-wider",
        bangersFont.className
      )}
    >
      <div className="text-center flex flex-col items-center w-full">
        <div className="bg-white w-56 h-56 p-8 rounded-full mb-4">
          <Image
            src={logo}
            alt="logo"
            width={300}
            height={300}
            className="w-full"
          />
        </div>
        <h1 className="font-bold text-6xl">Break Time</h1>
        <p className="text-xl">Digital Time Capsules</p>

        <div
          className={cn(
            "mt-4 w-full space-y-4 font-semibold text-3xl uppercase",
            bangersFont.className
          )}
        >
          <div className="p-4 bg-[#1DB9D2] ml-[20%] text-left">
            Build Your Pinata: A Digital Time Capsule for Cherished Memories
          </div>
          <div className="p-4 bg-[#FFDD00] mr-[20%] text-black text-right">
            Collaborate with Friends by Sharing Digital Mementos
          </div>
          <div className="p-4 bg-[#CE3F8F] ml-[20%] text-left">
            Unseal Your Pinata and Rediscover Moments You’ve Stored
          </div>
          <div className="p-4 bg-[#6D57FF] mr-[20%] text-right">
            Travel Back in Time: Relive Your Past Contributions
          </div>
        </div>
        <Link
          href="/app/dashboard"
          className={cn(buttonVariants(), "mt-8 text-lg font-bold py-8 px-6")}
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
