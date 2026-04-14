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
  { label: "Manager", value: "MANAGER" },
  { label: "Employee", value: "EMPLOYEE" },
];

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setLoginError(null); // clear previous error

    // Detect if input is an email or username
    const isEmail = values.email.includes("@");
    const payload = {
      ...values,
      // Send as "email" if it looks like one, otherwise as "username"
      ...(isEmail
        ? { email: values.email, username: undefined }
        : { username: values.email, email: undefined }),
    };

    try {
      setIsLoading(true);
      const res = await loginUser(payload);

      const { token, user } = res;

      localStorage.setItem("accessToken", token);
      localStorage.setItem("role", user.role.toLowerCase());
      localStorage.setItem("email", user.email);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("name", user.name);

      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "MANAGER") {
        navigate("/manager/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    } catch (err) {
      console.error(err);
      setLoginError(
        "Invalid credentials. Please check your details and try again.",
      );
    } finally {
      // ✅ Always re-enable the form — fixes the freeze on failed login
      setIsLoading(false);
    }
  }

  return (
    <div className="my-8">
      <Card className="w-full py-12 border-none shadow-md px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Banner */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                {loginError}
              </div>
            )}

            {/* Email or Username */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Username or Email"
                      {...field}
                      disabled={isLoading}
                      className="ring-white"
                      autoComplete="username"
                      onChange={(e) => {
                        field.onChange(e);
                        if (loginError) setLoginError(null); // clear error on edit
                      }}
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
                        disabled={isLoading}
                        className="ring-white pr-10"
                        autoComplete="current-password"
                        onChange={(e) => {
                          field.onChange(e);
                          if (loginError) setLoginError(null); // clear error on edit
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
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
                        disabled={isLoading}
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
                  <Loader className="animate-spin mr-2" size={18} />
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
