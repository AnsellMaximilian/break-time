import React from "react";
import Countdown, { CountdownRendererFn } from "react-countdown";

const ClockModule = ({ value, label }: { value: number; label: string }) => {
  return (
    <div className="">
      <span className="font-bold text-2xl">{value}</span>{" "}
      <span className="text-xs">{label}</span>
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
        <ClockModule value={days} label={"days"} />
        <ClockModule value={hours} label={"hours"} />
        <ClockModule value={minutes} label={"minutes"} />
        <ClockModule value={seconds} label={"seconds"} />
      </div>
    );
  }
};

export default function CountDownTimer({ date }: { date: string }) {
  return <Countdown date={new Date(date)} renderer={renderer} />;
}
