import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center grow">
      <Link href="/app/dashboard" className={cn(buttonVariants())}>
        Get Started
      </Link>
    </div>
  );
}
