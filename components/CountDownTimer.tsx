import React from "react";
import Countdown, { CountdownRendererFn } from "react-countdown";

const ClockModule = ({ value, label }: { value: number; label: string }) => {
  return (
    <div className="flex flex-col gap-1 items-center">
      <div className="text-center font-bold text-2xl p-1 w-14 bg-white">
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-tighter">
        {label}
      </div>
    </div>
  );
};

const renderer: CountdownRendererFn = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}) => {
  if (completed) {
    return <span>Time's up!</span>;
  } else {
    return (
      <div className="flex gap-2">
        <ClockModule value={days} label={"Days"} />
        <ClockModule value={hours} label={"Hours"} />
        <ClockModule value={minutes} label={"Minutes"} />
        <ClockModule value={seconds} label={"Seconds"} />
      </div>
    );
  }
};

export default function CountDownTimer({ date }: { date: string }) {
  return <Countdown date={new Date(date)} renderer={renderer} />;
}
