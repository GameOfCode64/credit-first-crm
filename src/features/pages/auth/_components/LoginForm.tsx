import z from "zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "../../../../components/ui/card";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../../../services/auth.Service";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema } from "../../../../utils/formSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import { ArrowRight, Eye, EyeOff, Loader } from "lucide-react";

const roles = [
  { label: "Admin", value: "ADMIN" },
  { label: "Manager", value: "MANAGER" },
  { label: "Employee", value: "EMPLOYEE" },
];

const LoginForm = () => {
  const [isLoading, setisLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      //   role: undefined,
      //   rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    try {
      setisLoading(true);
      const res = await loginUser(values);
      setisLoading(false);

      const { token, user } = res;

      // 🔐 STORE AUTH DATA (CONSISTENT KEYS)
      localStorage.setItem("accessToken", token);
      localStorage.setItem("role", user.role.toLowerCase()); // IMPORTANT
      localStorage.setItem("email", user.email);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("name", user.name);

      // 🚀 ROLE-BASED REDIRECT
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "MANAGER") {
        navigate("/manager/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    } catch (err) {
      setisLoading(false);
      console.error(err);
      alert("Login failed: Invalid credentials");
    }
  }

  return (
    <div className="my-8">
      <Card className="w-full py-12 border-none shadow-md px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@creditfirstindia.com"
                      {...field}
                      className="ring-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                        className="ring-white pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="ring-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {roles.map((role, index) => (
                          <SelectItem key={index} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remember Me */}
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="rememberMe">Remember me for 7 days</Label>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              disabled={isLoading}
              className="w-full bg-[#ba8b09] hover:bg-[#ba8b09]/90 text-white"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-1" size={18} />
                </>
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default LoginForm;
