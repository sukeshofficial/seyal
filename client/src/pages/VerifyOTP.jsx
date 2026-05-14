import React from "react";
import VerifyOTPCard from "@/components/auth/VerifyOTPCard";
import { Toaster } from "react-hot-toast";

const VerifyOTP = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4 font-sans">
            <Toaster position="top-center" reverseOrder={false} />

            <div className="w-full max-w-md animate-in fade-in zoom-in slide-in-from-top-4 duration-500">
                <VerifyOTPCard />

                <p className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
                    Make sure to check your spam folder if you don't see the email.
                </p>
            </div>
        </div>
    );
};

export default VerifyOTP;
