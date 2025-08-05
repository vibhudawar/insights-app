"use client";

import {signIn, getSession} from "next-auth/react";
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
 const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
 });
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState("");
 const [passwordStrength, setPasswordStrength] = useState("");
 const router = useRouter();

 useEffect(() => {
  // Check if already authenticated
  getSession().then((session) => {
   if (session) {
    router.push("/dashboard");
   }
  });
 }, [router]);

 const checkPasswordStrength = (password: string) => {
  if (password.length < 8) return "weak";
  if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) return "strong";
  return "medium";
 };

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const {name, value} = e.target;
  setFormData((prev) => ({...prev, [name]: value}));

  if (name === "password") {
   setPasswordStrength(checkPasswordStrength(value));
  }
 };

 const handleGoogleSignUp = async () => {
  setIsLoading(true);
  setError("");
  try {
   const result = await signIn("google", {
    callbackUrl: "/dashboard",
    redirect: false,
   });
   if (result?.error) {
    setError("Failed to sign up with Google");
   }
  } catch {
   setError("An error occurred. Please try again.");
  } finally {
   setIsLoading(false);
  }
 };

 const handleEmailSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  // Validation
  if (formData.password !== formData.confirmPassword) {
   setError("Passwords do not match");
   setIsLoading(false);
   return;
  }

  if (formData.password.length < 8) {
   setError("Password must be at least 8 characters long");
   setIsLoading(false);
   return;
  }

  // For now, we'll only support Google OAuth
  // This is a placeholder for future email/password implementation
  setError("Email/password signup coming soon. Please use Google for now.");
  setIsLoading(false);
 };

 return (
  <div className="min-h-screen hero bg-base-200">
   <div className="hero-content flex-col lg:flex-row-reverse">
    <div className="text-center lg:text-left">
     <h1 className="text-5xl font-bold">Create Account!</h1>
     <p className="py-6">
      Join thousands of teams who use Insights to build better products. Create
      your account and start collecting feedback in minutes.
     </p>
    </div>

    <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
     <div className="card-body">
      <div className="text-center mb-6">
       <Link href="/" className="text-2xl font-bold">
        Insights
       </Link>
       <p className="text-sm text-gray-600 mt-2">Create your account</p>
      </div>

      {error && (
       <div className="alert alert-error mb-4">
        <svg
         xmlns="http://www.w3.org/2000/svg"
         className="stroke-current shrink-0 h-6 w-6"
         fill="none"
         viewBox="0 0 24 24"
        >
         <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
         />
        </svg>
        <span>{error}</span>
       </div>
      )}

      {/* Google Sign Up */}
      <button
       onClick={handleGoogleSignUp}
       disabled={isLoading}
       className="btn btn-outline w-full mb-4"
      >
       {isLoading ? (
        <span className="loading loading-spinner loading-sm"></span>
       ) : (
        <>
         <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
           fill="currentColor"
           d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
           fill="currentColor"
           d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
           fill="currentColor"
           d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
           fill="currentColor"
           d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
         </svg>
         Continue with Google
        </>
       )}
      </button>

      <div className="divider">OR</div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailSignUp}>
       <div className="form-control">
        <label className="label">
         <span className="label-text">Full Name</span>
        </label>
        <input
         type="text"
         name="fullName"
         placeholder="Enter your full name"
         className="input input-bordered"
         value={formData.fullName}
         onChange={handleInputChange}
         required
        />
       </div>

       <div className="form-control">
        <label className="label">
         <span className="label-text">Email</span>
        </label>
        <input
         type="email"
         name="email"
         placeholder="Enter your email"
         className="input input-bordered"
         value={formData.email}
         onChange={handleInputChange}
         required
        />
       </div>

       <div className="form-control">
        <label className="label">
         <span className="label-text">Username</span>
        </label>
        <input
         type="text"
         name="username"
         placeholder="Choose a username"
         className="input input-bordered"
         value={formData.username}
         onChange={handleInputChange}
         required
        />
        <label className="label">
         <span className="label-text-alt">
          3-20 characters, letters, numbers, and underscore only
         </span>
        </label>
       </div>

       <div className="form-control">
        <label className="label">
         <span className="label-text">Password</span>
        </label>
        <input
         type="password"
         name="password"
         placeholder="Create a password"
         className="input input-bordered"
         value={formData.password}
         onChange={handleInputChange}
         required
        />
        {formData.password && (
         <div className="label">
          <span
           className={`label-text-alt ${
            passwordStrength === "strong"
             ? "text-green-600"
             : passwordStrength === "medium"
             ? "text-yellow-600"
             : "text-red-600"
           }`}
          >
           Password strength: {passwordStrength}
          </span>
         </div>
        )}
       </div>

       <div className="form-control">
        <label className="label">
         <span className="label-text">Confirm Password</span>
        </label>
        <input
         type="password"
         name="confirmPassword"
         placeholder="Confirm your password"
         className="input input-bordered"
         value={formData.confirmPassword}
         onChange={handleInputChange}
         required
        />
       </div>

       <div className="form-control mt-6">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
         {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
         ) : (
          "Create Account"
         )}
        </button>
       </div>
      </form>

      <div className="text-center mt-4">
       <p className="text-sm">
        Already have an account?{" "}
        <Link href="/auth/signin" className="link link-primary">
         Sign in
        </Link>
       </p>
      </div>

      <div className="text-center mt-4">
       <p className="text-xs text-gray-500">
        By creating an account, you agree to our{" "}
        <a href="#" className="link link-primary">
         Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="link link-primary">
         Privacy Policy
        </a>
       </p>
      </div>
     </div>
    </div>
   </div>
  </div>
 );
}
