import * as React from "react";
import { cn } from "@/lib/utils";

export function Squircle({ className, ...props }) {
  return (
    <div
      className={cn("absolute inset-0 rounded-[24px] -z-10 pointer-events-none", className)}
      {...props}
    />
  );
}
export default Squircle;
