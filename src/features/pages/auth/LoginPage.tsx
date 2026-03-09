import React from "react";
import { Building2, CreditCard, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import LoginForm from "./_components/LoginForm";
import { useAppStore } from "@/hooks/appStore";

const testimonialData = [
  {
    icon: Building2,
    title: "Enterprise Ready",
    description: "Built for teams of all sizes with role-based access control",
  },
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    description: "Track performance metrics and make data-driven decisions",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Bank-level security with industry-standard compliance",
  },
];

const LoginPage = () => {
  const version = useAppStore((s) => s.version);
  return (
    <div className="grid grid-cols-2 w-full h-screen">
      <div className="w-full bg-[#b98b08] h-full">
        <div className="flex flex-col px-12 py-12">
          {/* logo */}
          <div className="flex flex-row">
            <div className="w-12 h-12 flex items-center justify-center bg-white/25 rounded-xl">
              <CreditCard className="text-white" />
            </div>
            <div className="flex flex-col ml-2 gap-0">
              <h1 className="text-white text-[18px]  font-bold ">
                Credit First India
              </h1>
              <p className="font-semibold text-[12px] text-white">
                CRM Platform
              </p>
            </div>
          </div>

          {/* Mid Content */}
          <div className="mt-16 flex flex-col">
            <h1 className="max-w-md text-white text-4xl font-extrabold">
              Manage your business with confidence
            </h1>
            <p className="mt-12 max-w-lg text-white font-semibold">
              Streamline operations, track performance, and grow your business
              with our comprehensive CRM platform.
            </p>
          </div>

          {/* testimonial */}
          <div className="flex flex-col">
            <div className="mt-10">
              {testimonialData.map((data, index) => (
                <div className="flex flex-row mt-5" key={index}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/25">
                    <data.icon className="text-white" />
                  </div>
                  <div className="flex flex-col ml-3">
                    <h1 className="font-semibold text-white">{data.title}</h1>
                    <p className="text-white/80 text-sm ">{data.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Copyright */}
          <div className="flex flex-col">
            <h1 className="mt-4 text-white/70 font-semibold">
              © 2025 Credit First India Pvt Ltd. All rights reserved.
            </h1>
            <p className="mt-4 text-white/70 font-semibold">
              Version: V{version}
            </p>
          </div>
        </div>
      </div>
      <div className="px-24 py-12">
        <h1 className="text-3xl text-[#c39109]  font-bold">Welcome back</h1>
        <p className="mt-2 ">Sign in to your account to continue</p>
        {/* Login Form */}
        <LoginForm />
        {/* not have account */}
        <h3 className="text-center">
          Don't have an account?
          <Link to={"/"} className="text-[#c39109] font-semibold ml-1">
            Contact your administrator
          </Link>
        </h3>
      </div>
    </div>
  );
};

export default LoginPage;
