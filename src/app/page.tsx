"use client"

import Image from "next/image";
import Logo from "../../public/logo-ace.png"
import Background from "../../public/background.jpg"
import {useState} from "react";
import {useRouter} from "next/navigation";


export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // handler function for the login
  const handleLogin = async (e: any): Promise<void> => {
    e.preventDefault();

    try {
      // submit credentials to the authentication server
      const response: Response = await fetch('http://localhost:3002/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      // when response if ok
      if (response.ok) {
        const data: any = await response.json();
        localStorage.setItem("token", data.token)

        const roles: string[] = data.user.roles
        console.log(roles)
        // route based on roles
        if (roles.includes('ROLE_ADMIN')) {
          router.push('/admin');
        }
        else if (roles.includes('ROLE_MANAGER')) {
          router.push('/manager');
        } else if (roles.includes('ROLE_EMPLOYEE')) {
          router.push('/employee');
        }

      } else {
        setErrorMessage("Invalid username or password");
      }

    } catch(error) {
      setErrorMessage("an error occured during login");
      console.error(error);
    }
  }

  return (
      <div
          className="hero min-h-screen flex items-center justify-center"
          style={{
            backgroundImage:
                `url(${Background.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-neutral-content ">
          <div className="relative py-3 sm:max-w-xl sm:mx-auto">
            <div
                className="absolute inset-0 bg-gradient-to-r from-blue-300 to-green-400 shadow-2xl transform -skew-y-6 sm:skew-y-0 sm:-rotate-5 sm:rounded-3xl "></div>
            <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
              <div className="flex justify-center items-center -mt-10">
                <Image
                    src={Logo}
                    alt="logo"
                    className="h-32 w-40"
                />
              </div>
              <div className="max-w-md mx-auto">
                <div>
                  <h1 className="text-xl font-semibold text-black font-custom">Ace Integrated Management System</h1>
                </div>
                <div className="divide-y divide-gray-200">
                  <form
                      className="py-8 text-base leading-6 space-y-6 text-gray-700 sm:text-lg sm:leading-7"
                      onSubmit={handleLogin}

                  >
                    {/* Email Field */}
                    <div className="relative">
                      <input
                          autoComplete="off"
                          id="email"
                          name="email"
                          type="text"
                          className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300
                                          text-gray-900 focus:outline-none focus:border-blue-600"
                          placeholder="Email address"
                          required
                          onChange={(e): void => setUsername(e.target.value)}
                      />
                      <label
                          htmlFor="email"
                          className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base
                                           peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5
                                            peer-focus:text-gray-600 peer-focus:text-sm font-custom"
                      >
                        Username
                      </label>
                    </div>

                    <div className="relative">
                      <input
                          autoComplete="off"
                          id="password"
                          name="password"
                          type="password"
                          className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300
                                           text-gray-900 focus:outline-none focus:border-blue-600 font-custom text-sm"
                          placeholder="Password"
                          required
                          onChange={(e): void => setPassword(e.target.value)}
                      />
                      <label
                          htmlFor="password"
                          className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base
                                          peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5
                                           peer-focus:text-gray-600 peer-focus:text-sm font-custom"
                      >
                        Password
                      </label>
                    </div>

                    <div className="flex items-center justify-center space-x-4">
                      <a
                          href="#"
                          className="text-sm text-blue-500 hover:underline font-custom"
                      >
                        Forgot password?
                      </a>
                      <div className="h-5 border-l border-gray-300"></div>
                      <a
                          href="#"
                          className="text-sm text-blue-500 hover:underline font-custom"
                      >
                        Create account
                      </a>
                    </div>
                    <div className="text-center -mb-10">
                      <button
                          type="submit"
                          className="bg-blue-500 text-white rounded-2xl px-4 py-2 text-center
                                          hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 -mb-10 text-sm font-custom"
                      >
                        Login
                      </button>
                    </div>
                  </form>
                </div>
                {errorMessage && (
                    <p style={{color: "red"}} className="text-center font-custom">
                      {errorMessage}
                    </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
