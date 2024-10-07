"use client";

import Image from "next/image";
import logo from "@/assets/breaktime-full-logo.svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { config, functions } from "@/lib/appwrite";
import { ExecutionMethod } from "appwrite";
import publicRoute from "@/hooks/publicRoute";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2).max(100),
  username: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string(),
});

function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { name, username, email, password } = values;

      const body = {
        name,
        username,
        email,
        password,
      };

      setIsLoading(true);

      const res = await functions.createExecution(
        config.registerFuncId,
        JSON.stringify(body),
        false,
        "/",
        ExecutionMethod.POST
      );

      console.log(res);
      if (!res.errors) {
        router.push("/app/profile");
      } else {
        toast({
          title: "Registration Failed",
          variant: "destructive",
          description: res.errors,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="flex flex-col justify-center grow items-center p-4">
      <Card className="w-full md:w-[500px] max-w-full">
        <CardHeader className="text-center">
          <Image
            src={logo}
            width={100}
            height={100}
            alt="logo"
            className="mx-auto block mb-2"
          />

          <CardTitle className="">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex">
                <Button type="submit" className="ml-auto" disabled={isLoading}>
                  Register
                </Button>{" "}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="mt-2">
        Already have an account? Login{" "}
        <Link href="/app/login" className="text-primary">
          here
        </Link>
      </div>
    </div>
  );
}

export default publicRoute(RegisterPage);
